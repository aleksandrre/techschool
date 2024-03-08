// controllers/potentialStudentController.js

import { PotentialStudent } from "../models/potentialStudentModel.js";

// Controller function to save potential student information
export const savePotentialStudent = async (req, res) => {
  try {
    const { name, courseName, phone } = req.body;

    // Validate the required fields
    if (!name || !courseName || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the phone number is already registered
    const existingStudent = await PotentialStudent.findOne({ phone });

    if (existingStudent) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }

    // Create a new potential student instance
    const newPotentialStudent = new PotentialStudent({
      name,
      courseName,
      phone,
    });

    // Save the potential student to the database
    await newPotentialStudent.save();

    res
      .status(201)
      .json({ message: "Potential student information saved successfully" });
  } catch (error) {
    console.error("Error saving potential student information:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Controller function to get all potential students
export const getAllPotentialStudents = async (req, res) => {
  try {
    const potentialStudents = await PotentialStudent.find();
    res.status(200).json({ potentialStudents });
  } catch (error) {
    console.error("Error fetching potential students:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
