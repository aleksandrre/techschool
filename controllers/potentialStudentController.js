// controllers/potentialStudentController.js

import { PotentialStudent } from "../models/potentialStudentModel.js";

// Controller function to save potential student information
export const addPotentialStudent = async (req, res) => {
  try {
    const { name, courseName, phone, promoCode } = req.body;

    // Validate the required fields
    if (!name || !courseName || !phone) {
      return res.status(400).json({
        message: "The fields 'name', 'courseName', and 'phone' are required",
      });
    }

    // Check if the phone number is already registered
    const existingStudent = await PotentialStudent.findOne({ phone });

    if (existingStudent) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }

    // Create a new potential student instance
    let newPotentialStudent;

    if (promoCode) {
      // If promoCode is provided, create a new student with promoCode
      newPotentialStudent = new PotentialStudent({
        name,
        courseName,
        phone,
        promoCode,
      });
    } else {
      // If promoCode is not provided, create a new student without promoCode
      newPotentialStudent = new PotentialStudent({
        name,
        courseName,
        phone,
      });
    }

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

// Controller function to delete a potential student
//გასატესტია
export const deletePotentialStudent = async (req, res) => {
  try {
    const { potentialStudentId } = req.params;

    // Check if the potential student exists and delete if it does
    const potentialStudent = await PotentialStudent.findByIdAndDelete(
      potentialStudentId
    );

    // If the potential student doesn't exist, return a 404 response
    if (!potentialStudent) {
      return res.status(404).json({ message: "Potential student not found" });
    }

    res.status(200).json({ message: "Potential student deleted successfully" });
  } catch (error) {
    console.error("Error deleting potential student:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Controller function to delete all potential students
//გასატესტია
export const deleteAllPotentialStudents = async (req, res) => {
  try {
    // Delete all potential students from the database
    await PotentialStudent.deleteMany({});

    res
      .status(200)
      .json({ message: "All potential students deleted successfully" });
  } catch (error) {
    console.error("Error deleting all potential students:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
