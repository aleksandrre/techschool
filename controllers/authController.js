import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Student } from "../models/studentModel.js";
import { Teacher } from "../models/teacherModel.js";
import { Admin } from "../models/adminModel.js";
import { Group } from "../models/groupModel.js";

import dotenv from "dotenv";
import configureMulter from "../services/configureMulter.js";
import { uploadFilesToS3 } from "../services/s3Service.js";

dotenv.config();
// Function to generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m", // Set your desired token expiration time
    }
  );
};

// Controller function for login ჯერ ადმინში მოძებნოს მერე თიჩერში და მერე სტუდენტებში
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Try to find the user in each model
    let user = await Student.findOne({ username });

    if (!user) {
      user = await Teacher.findOne({ username });
    }

    if (!user) {
      user = await Admin.findOne({ username });
    }

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If authentication is successful, generate a token
    const accessToken = generateAccessToken(user);

    // Send the token to the client
    //დავაკომენტაროთ სექური და ონლი
    res.cookie("accessToken", accessToken, {
      // httpOnly: true,
      // secure: true,
      sameSite: "strict",
    });
    res.status(200).json({
      message: "Login successful",
      user: { username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ message: "Internal Server Errrrrrrrror", error: error });
  }
};

export const logout = (req, res) => {
  // Clear the access token cookie
  res.clearCookie("accessToken");

  // Send a response indicating successful logout
  res.status(200).json({ message: "Logout successful" });
};

export const registerUser = async (req, res) => {
  const { username, password, email, groupId } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const signedInUserRole = req.user.role;

    // Check if the provided groupId exists in the Group model
    const existingGroup = await Group.findById(groupId);
    if (!existingGroup) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    if (signedInUserRole === "admin") {
      const existingteacher = await Teacher.findOne({ username });

      if (existingteacher) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      const newTeacher = new Teacher({
        username,
        password: hashedPassword,
        email,
        group: groupId,
      });
      await newTeacher.save();

      // Assign the teacher to the specified group
      await Group.findByIdAndUpdate(groupId, {
        $set: { teacher: newTeacher._id },
      });

      res.status(201).json({ message: "Teacher created successfully" });
    } else if (signedInUserRole === "teacher") {
      const existingstudent = await Student.findOne({ username });

      if (existingstudent) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      const newStudent = new Student({
        username,
        password: hashedPassword,
        group: groupId,
      });
      await newStudent.save();

      // Add the student to the group
      await Group.findByIdAndUpdate(groupId, {
        $addToSet: { students: newStudent._id },
      });

      res.status(201).json({ message: "Student created successfully" });
    } else {
      res.status(403).json({ message: "Permission denied" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const { username, role } = req.user;

  try {
    // Check if new passwords match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // Determine which model to use based on the role
    let UserModel;
    switch (role) {
      case "student":
        UserModel = Student;
        break;
      case "teacher":
        UserModel = Teacher;
        break;
      case "admin":
        UserModel = Admin;
        break;
      default:
        return res.status(400).json({ message: "Invalid role" });
    }

    // Find the user by username
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the old password
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
