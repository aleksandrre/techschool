import { Teacher } from "../models/teacherModel.js";
import { Group } from "../models/groupModel.js";
import { Day } from "../models/dayModel.js";
import configureMulter from "../services/configureMulter.js";
import { deleteFileFromS3, uploadFilesToS3 } from "../services/s3Service.js";
import { Student } from "../models/studentModel.js";

export async function activateDayStatus(req, res) {
  try {
    const { userId } = req.user;
    const { groupId, dayId } = req.params;

    // Find the teacher
    const teacher = await Teacher.findById(userId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Ensure the teacher is associated with the group
    if (!teacher.group.includes(groupId)) {
      return res
        .status(403)
        .json({ error: "Teacher does not have access to this group" });
    }

    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Find and update the current day's dayStatus to "active"
    const updatedDay = await Day.findByIdAndUpdate(
      dayId,
      { dayStatus: "active" },
      { new: true }
    );

    if (!updatedDay) {
      return res.status(404).json({ error: "Day not found" });
    }

    // Find all previous days in the group and update their dayStatus to "past"
    const resultPast = await Day.updateMany(
      { _id: { $lt: dayId }, group: groupId, dayStatus: { $ne: "past" } },
      { dayStatus: "past" }
    );

    // Update next days to "future"
    const resultFuture = await Day.updateMany(
      { _id: { $gt: dayId }, group: groupId, dayStatus: { $ne: "future" } },
      { dayStatus: "future" }
    ); // Log the result to see the number of documents modified

    // If you need to perform any additional logic without calling next

    // Send a response
    res.status(200).json({
      message: "Day status updated successfully",
      updatedDay,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export const addTeacherHomeworkFile = async (req, res) => {
  try {
    // Extract group ID and day ID from request parameters
    const { groupId, dayId } = req.params;

    // Find the group by ID and populate the 'days' field
    const group = await Group.findById(groupId).populate("days");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Within the group, find the day by ID
    const day = group.days.find((day) => day._id.equals(dayId));

    if (!day) {
      return res.status(404).json({ message: "Day not found in the group" });
    }

    // Check if a file has already been uploaded
    if (day.homework.teacherFilePath) {
      return res
        .status(400)
        .json({ message: "File already uploaded for this day" });
    }

    // Use configureMulter to get the uploaded file
    const file = await configureMulter(1)(req, res);

    // Check if file exists
    if (!file) {
      console.error("No file found in the request.");
      return res.status(400).json({ message: "No file found in the request" });
    }

    // Upload the file to S3
    const uploadedFilePath = await uploadFilesToS3([file]);
    // Update day.homework.teacherFilePath
    day.homework.teacherFilePath = uploadedFilePath[0];
    await day.save();
    // Save the updated group (assuming you want to save changes to the group)
    await group.save();

    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTeacherHomeworkFile = async (req, res) => {
  try {
    const { groupId, dayId } = req.params;

    // Find the group by ID and populate the 'days' field
    const group = await Group.findById(groupId).populate("days");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Within the group, find the day by ID
    const day = group.days.find((day) => day._id.equals(dayId));

    if (!day) {
      return res.status(404).json({ message: "Day not found in the group" });
    }

    // Check if a file has been uploaded
    if (!day.homework.teacherFilePath) {
      return res.status(404).json({ message: "File not found for this day" });
    }

    // Delete the file from S3
    await deleteFileFromS3(day.homework.teacherFilePath);

    // Remove the file path from MongoDB
    day.homework.teacherFilePath = null;
    await day.save();

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const writeAttandance = async (req, res) => {
  try {
    // Extract parameters from the request
    const { dayId, groupId, studentId } = req.params;
    const { status } = req.body; // Assuming you pass the attendance status in the request body

    // Find the day by ID
    const day = await Day.findOne({ _id: dayId, group: groupId });

    // Check if the day exists
    if (!day) {
      return res
        .status(404)
        .json({ message: "Day not found in the specified group" });
    }

    // Check if the user making the request is authorized to write attendance
    // Add your authorization logic here if needed

    // Find the attendance entry for the specified student
    const studentAttendance = day.attendance.find(
      (entry) => entry.student.toString() === studentId
    );

    // If the studentAttendance is not found, create a new entry with the specified status
    if (!studentAttendance) {
      day.attendance.push({
        student: studentId,
        status: status,
      });
    } else {
      // Update the attendance status for the specified student
      studentAttendance.status = status;
    }

    // Save the updated day document
    await day.save();

    // Return success response
    res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const writeLaborMark = async (req, res) => {
  try {
    // Extract parameters from the request
    const { dayId, groupId, studentId } = req.params;
    let { mark } = req.body; // Assuming you pass the mark in the request body

    // Validate mark to be not more than 10
    mark = Math.min(mark, 10);

    // Find the day by ID
    const day = await Day.findOne({ _id: dayId, group: groupId });

    // Check if the day exists
    if (!day) {
      return res
        .status(404)
        .json({ message: "Day not found in the specified group" });
    }

    // Check if the user making the request is authorized to write labor mark
    // Add your authorization logic here if needed

    // Find the labor entry for the specified student
    const laborEntry = day.homework.labors.find(
      (entry) => entry.student.toString() === studentId
    );

    // If the labor entry is not found, create a new entry with the specified mark
    if (!laborEntry) {
      day.homework.labors.push({
        student: studentId,
        laborFilePath: [], // Assuming an empty array for laborFilePath
        marks: mark,
      });
    } else {
      // Update the points for the specified student based on the mark difference
      const oldMark = laborEntry.marks || 0;
      const markDifference = mark - oldMark;

      // Update the mark for the specified student
      laborEntry.marks = mark;

      // Save the updated day document
      await day.save();

      // Update student points
      const student = await Student.findById(studentId);
      if (student) {
        student.points += markDifference;
        await student.save();
      }
    }

    // Return success response
    res.status(200).json({ message: "Labor mark updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//გვიგზავნის ინფორმაციას ერთი დღის სტუდენტების შესახებ
export const getDayStudentsInfo = async (req, res) => {
  try {
    const { groupId, dayId } = req.params;

    // Find the group with the given groupId
    const group = await Group.findById(groupId).populate("students");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Find the day with the given dayId
    const day = await Day.findById(dayId);

    if (!day) {
      return res.status(404).json({ error: "Day not found" });
    }

    // Map students to get attendance status and homework labor file paths
    const studentsInfo = group.students.map((student) => {
      const attendance = day.attendance.find((a) =>
        a.student.equals(student._id)
      );
      const homework = day.homework.labors.find((labor) =>
        labor.student.equals(student._id)
      );

      return {
        studentId: student._id,
        username: student.username,
        photo: student.photo,
        attendanceStatus: attendance?.status ? attendance.status : false,
        laborFilePath: homework?.laborFilePath ? homework.laborFilePath : null,
      };
    });

    res
      .status(200)
      .json({ studentsInfo, teacherFilePath: day.homework.teacherFilePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//it is not tested
export const updatesyllabus = async (req, res) => {
  try {
    const { userId } = req.user;
    const { groupId, dayId } = req.params;
    const { dayTheme } = req.body;

    // Find the teacher
    const teacher = await Teacher.findById(userId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Ensure the teacher is associated with the group
    if (!teacher.group.includes(groupId)) {
      return res
        .status(403)
        .json({ error: "Teacher does not have access to this group" });
    }

    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Find and update the current day's dayStatus to "active"
    const updatedDay = await Day.findByIdAndUpdate(
      dayId,
      { dayTheme: dayTheme },
      { new: true }
    );
    if (!updatedDay) {
      return res.status(404).json({ error: "Day not found" });
    }

    res.status(200).json(updatedDay);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletestudent = async (req, res) => {
  const { groupId, studentId } = req.params;

  try {
    // Find the group by ID
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Find the student by ID
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Remove the student from the group
    group.students.pull(studentId);
    await group.save();

    // Delete the student from the Student model
    await Student.findByIdAndDelete(studentId);

    res.json({
      message: "Student deleted from group and student model successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addresource = async (req, res) => {
  const { dayId } = req.params;
  const { title, path } = req.body;

  try {
    // Find the day by its ID
    const day = await Day.findById(dayId);

    if (!day) {
      return res.status(404).json({ error: "Day not found" });
    }

    // Add the resource to the day's resources array
    day.resources.push({ title, path });

    // Save the updated day
    await day.save();

    return res
      .status(200)
      .json({ message: "Resource added successfully", day });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteresource = async (req, res) => {
  const { dayId } = req.params;
  const resourceIndex = req.body.resourceIndex; // Assuming you send the resourceIndex in the request body

  try {
    // Find the day by its ID
    const day = await Day.findById(dayId);

    if (!day) {
      return res.status(404).json({ error: "Day not found" });
    }

    // Check if resourceIndex is within bounds
    if (resourceIndex < 0 || resourceIndex >= day.resources.length) {
      return res.status(400).json({ error: "Invalid resource index" });
    }

    // Remove the resource from the array
    day.resources.splice(resourceIndex, 1);

    // Save the updated day
    await day.save();

    return res
      .status(200)
      .json({ message: "Resource deleted successfully", day });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
