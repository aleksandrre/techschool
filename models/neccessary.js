// Import necessary modules and Day model
import express from "express";
import { Day } from "../models/dayModel";

// Create an Express router
const router = express.Router();

// Route to remove a specific laborFilePath for a specific student in a day
router.put(
  "/api/day/:dayId/removeLaborFilePath/:studentId",
  async (req, res) => {
    const { dayId, studentId } = req.params;
    const { filePathIndex } = req.body; // Assuming you pass the index of the filePath to remove in the request body

    try {
      // Find the day by ID
      const day = await Day.findById(dayId);

      // Check if the day exists
      if (!day) {
        return res.status(404).json({ message: "Day not found" });
      }

      // Find the labor entry by student ID
      const labor = day.homework.labors.find(
        (labor) => labor.student.toString() === studentId
      );

      // Check if the labor entry exists
      if (!labor) {
        return res.status(404).json({ message: "Labor entry not found" });
      }

      // Remove the specified filePath from the labor entry
      labor.laborFilePath.splice(filePathIndex, 1);

      // Save the updated day
      await day.save();

      res
        .status(200)
        .json({ message: "LaborFilePath removed successfully", day });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Export the router
export default router;
