// studentController.js
import { Day } from "../models/dayModel.js";
import { Group } from "../models/groupModel.js";
import { Student } from "../models/studentModel.js";

import { deleteFileFromS3, uploadFilesToS3 } from "../services/s3Service.js";
import configureMulter from "../services/configureMulter.js";

export const addLaborToDay = async (req, res) => {
  try {
    const { dayId } = req.params;
    const { userId } = req.user;

    const day = await Day.findById(dayId);

    if (!day) {
      return res.status(404).json({ message: "Day not found" });
    }

    const existingLabor = day.homework.labors.find((labor) =>
      labor.student.equals(userId)
    );

    const files = await configureMulter(5)(req, res);

    // Check if files are present in the request
    if (!files || !Array.isArray(files) || files.length === 0) {
      console.error("No files found in the request.");
      return res.status(400).json({ message: "No files found in the request" });
    }

    // Check if the total number of files will exceed 5
    if (
      existingLabor &&
      existingLabor.laborFilePath.length + files.length > 5
    ) {
      return res
        .status(400)
        .json({ message: "Total number of files cannot exceed 5" });
    }

    const uploadedFilePaths = await uploadFilesToS3(files);

    if (existingLabor) {
      // If the labor entry already exists, update the 'laborFilePath' and save
      const updatedFilePaths =
        existingLabor.laborFilePath.concat(uploadedFilePaths);

      existingLabor.laborFilePath = updatedFilePaths;
      await day.save();

      return res
        .status(200)
        .json({ message: "Labor entry updated successfully" });
    } else {
      // If the labor entry does not exist, add a new entry
      day.homework.labors.push({
        student: userId,
        laborFilePath: uploadedFilePaths,
        marks: 0,
      });

      await day.save();

      return res
        .status(201)
        .json({ message: "New labor entry added successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// delete labor (homework)
//test this
export const deleteLaborFromDay = async (req, res) => {
  try {
    const { dayId } = req.params;
    const { laborFilePath } = req.body;
    const { userId } = req.user;

    const day = await Day.findById(dayId);

    if (!day) {
      return res.status(404).json({ message: "Day not found" });
    }

    const labor = day.homework.labors.find(
      (labor) => labor.student.toString() === userId
    );

    if (!labor) {
      return res.status(404).json({ message: "Labor entry not found" });
    }

    // Filter out the specified laborFilePath from the array
    const updatedLaborFilePaths = labor.laborFilePath.filter(
      (filePath) => filePath !== laborFilePath
    );

    // Delete the file from S3
    await deleteFileFromS3(laborFilePath);

    // Update the laborFilePaths in the labor entry
    labor.laborFilePath = updatedLaborFilePaths;

    // Save the updated day
    await day.save();

    return res.status(200).json({
      message: "LaborFilePath removed successfully",
      updatedLaborFilePaths,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

///////////////
//sheidzleba coomonshi gatana
export const getTeacherFilePath = async (req, res) => {
  try {
    // Extract parameters from the request
    const { dayId } = req.params;

    // Find the day by ID
    const day = await Day.findById(dayId);

    // Check if the day exists
    if (!day) {
      return res.status(404).json({ message: "Day not found" });
    }

    // Return the teacherFilePath value
    res.status(200).json({
      teacherFilePath: day.homework.teacherFilePath
        ? day.homework.teacherFilePath
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStudentActiveDayForDashboard = async (req, res) => {
  try {
    const { userId } = req.user;
    const { groupId } = req.params;

    // Find the group by its ID and populate the 'days' field
    const group = await Group.findById(groupId).populate("days");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Find the active day in the group's days
    const activeDay = group.days.find((day) => day.dayStatus === "active");

    if (!activeDay) {
      return res.status(404).json({
        message: "No active day found for the user in the specified group",
      });
    }

    // Send the information about the active day and user's labors in the response
    return res.status(200).json({
      activeDay: {
        id: activeDay._id,
        date: activeDay.date,
        index: activeDay.index,
        resources: activeDay.resources,
        dayTheme: activeDay.dayTheme,
        dayThemeText: activeDay.dayThemeText ? activeDay.dayThemeText : null,
        zipFilePath: activeDay.homework.zipFilePath
          ? activeDay.homework.zipFilePath
          : null,
        userLabors: activeDay.homework.labors
          ? activeDay.homework.labors.find(
              (labor) => labor.student.toString() === userId
            )
          : null,
      },
    });
  } catch (error) {
    console.error("Error retrieving active day for the user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStudentDirectDayHomework = async (req, res) => {
  try {
    const { groupId, dayId } = req.params;
    const { userId } = req.user;

    // Find the group by its ID and populate the days
    const group = await Group.findById(groupId).populate({
      path: "days",
      model: Day,
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Find the specified day by its ID
    const selectedDay = group.days.find((day) => day._id.equals(dayId));

    if (!selectedDay) {
      return res
        .status(404)
        .json({ message: "Day not found in the specified group" });
    }

    // Find the labor information for the student and day
    const labor = selectedDay.homework.labors.find((labor) =>
      labor.student.equals(userId)
    );

    // Extract relevant information
    const directDayHomework = {
      dayId: selectedDay._id,
      zipFilePath: selectedDay.homework.zipFilePath
        ? selectedDay.homework.zipFilePath
        : null,
      laborFilePath: labor ? labor.laborFilePath : null,
    };

    // Send the information in the response
    return res.status(200).json({ directDayHomework });
  } catch (error) {
    console.error("Error retrieving group direct day homework:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStudentAllDayHomework = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.user;

    // Find the group by its ID and populate the days
    const group = await Group.findById(groupId).populate({
      path: "days",
      model: Day,
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Filter days with dayStatus as "past" or "active" and having zipFilePath
    const filteredDays = group.days.filter(
      (day) => ["past", "active"].includes(day.dayStatus) //თუ მასწავლებელს არ აქვს ატვირთული დავალება არ ჩანს
    );

    // Map days and retrieve direct laborFilePath for the specified studentId
    const allDayHomework = filteredDays.map((day) => {
      const laborForStudent = (day.homework.labors || []).find(
        (labor) => labor.student.toString() === userId
      );

      return {
        dayId: day._id,
        index: day.index,
        dayTheme: day.dayTheme,
        homework: day.homework.zipFilePath || null,
        labors: laborForStudent?.laborFilePath || null,
        homeworkChecked: Boolean(laborForStudent?.laborFilePath), // Using Boolean to explicitly convert to a boolean value
      };
    });

    // Send the information in the response
    return res.status(200).json({ allDayHomework });
  } catch (error) {
    console.error("Error retrieving all day homework:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStudentAllDayInfo = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.user;

    // Find the group by its ID and populate the days
    const group = await Group.findById(groupId).populate({
      path: "days",
      model: Day,
      populate: {
        path: "homework.labors.student",
        model: Student,
        match: { _id: userId }, // Match only the logged-in student
        select: "username photo points",
      },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Extract relevant information from each day
    const allDayInfo = group.days.map((day) => ({
      dayId: day._id,
      date: day.date,
      index: day.index,
      mark: day.homework.labors
        .filter((labor) => labor.student !== null) // Filter out null values
        .map((labor) => ({
          mark: labor.marks,
        }))[0]?.mark,
      attendance: day.attendance.map((attendance) => ({
        attendance: attendance.status,
      }))[0]?.attendance,
    }));

    // Calculate the sum of marks and attendance
    const sumMarks = allDayInfo.reduce((sum, day) => sum + (day.mark || 0), 0);
    const sumAttendance = allDayInfo.reduce(
      (sum, day) => sum + (day.attendance || 0),
      0
    );
    const pastDaysCount =
      group.days.filter((day) => day.dayStatus === "past").length + 1;

    // Send the information along with the sums in the response
    return res.status(200).json({
      allDayInfo,
      averageMark: sumMarks / pastDaysCount,
      averageAttandence: sumAttendance / pastDaysCount,
      sumMarks,
      sumAttendance,
      pastDaysCount,
    });
  } catch (error) {
    console.error("Error retrieving group all day info:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
