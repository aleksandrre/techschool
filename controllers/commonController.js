import { Day } from "../models/dayModel.js";
import { Group } from "../models/groupModel.js";
import { Student } from "../models/studentModel.js";
import { Teacher } from "../models/teacherModel.js";
import configureMulter from "../services/configureMulter.js";
import {
  deleteFileFromS3,
  downloadFileFromS3,
  uploadFilesToS3,
} from "../services/s3Service.js";

export const downloadFile = async (req, res) => {
  const { filePath } = req.body;

  await downloadFileFromS3(filePath, res);
};

export const getlaborFilePaths = async (req, res) => {
  try {
    // Extract parameters from the request
    const { dayId } = req.params;
    const { role } = req.user;
    const userId = role === "student" ? req.user.userId : req.body.userId;

    const day = await Day.findById(dayId);

    // Check if the day exists
    if (!day) {
      return res.status(404).json({ message: "Day not found" });
    }

    // Find the labor entry for the authenticated user
    const laborEntry = day.homework.labors.find((labor) =>
      labor.student.equals(userId)
    );

    // Check if the labor entry exists
    if (!laborEntry) {
      return res.status(404).json({
        message: "Labor entry not found for the authenticated user on this day",
      });
    }

    // Return the laborFilePath values
    res.status(200).json({ laborFilePaths: laborEntry.laborFilePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGroupStudentsTeacher = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Find the group and populate the students and teacher
    const group = await Group.findById(groupId).populate({
      path: "students teacher",
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Extract the students and teacher from the populated group field
    const groupStudents = group.students.map((student) => ({
      username: student.username,
      photo: student.photo,
      points: student.points,
    }));

    const teacher = {
      username: group.teacher.username,
      photo: group.teacher.photo,
    };

    // Count the number of students in the group
    const numberOfStudents = group.students.length;

    // Send the group students information along with the count and teacher info in the response
    return res.status(200).json({ groupStudents, numberOfStudents, teacher });
  } catch (error) {
    console.error("Error retrieving group students:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGroupSyllabus = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate({
      path: "days",
      model: Day,
      select: "date dayTheme dayThemeText dayStatus index",
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    // Extract relevant information from each day
    const syllabus = group.days.map((day) => ({
      // groupId:group._id,
      dayId: day._id,
      date: day.date,
      index: day.index + 1,
      dayTheme: day.dayTheme,
      dayThemeText: day.dayThemeText,
      dayStatus: day.dayStatus,
      //აქ შიძლება დავალება homework დავამატოთ
    }));

    // Send the syllabus information in the response
    return res.status(200).json({ syllabus });
  } catch (error) {
    console.error("Error retrieving group syllabus:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getGroupAllDayResources = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Find the group by its ID and populate the days
    const group = await Group.findById(groupId).populate({
      path: "days",
      model: Day,
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Extract relevant information from each day
    const allDayResources = group.days.map((day) => ({
      dayId: day._id,
      dayTheme: day.dayTheme,
      resources: day.resources,
    }));

    // Send the information in the response
    return res.status(200).json({ allDayResources });
  } catch (error) {
    console.error("Error retrieving group all day resources:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGroupsInfo = async (req, res) => {
  try {
    const { userId, role } = req.user;

    let user;

    if (role === "teacher") {
      user = await Teacher.findById(userId).populate({
        path: "group",
        model: Group,
        populate: [
          {
            path: "teacher",
            model: Teacher,
          },
          {
            path: "days",
            model: Day,
          },
        ],
      });
    } else if (role === "student") {
      user = await Student.findById(userId).populate({
        path: "group",
        model: Group,
        populate: [
          {
            path: "teacher",
            model: Teacher,
          },
          {
            path: "days",
            model: Day,
          },
        ],
      });
    } else {
      return res.status(403).json({ message: "Invalid user role" });
    }

    if (!user) {
      return res.status(404).json({ message: `${role} not found` });
    }

    // Find the specified group in the user's groups
    const groups = user.group.map((group) => {
      const pastDays =
        group.days.filter((day) => day.dayStatus === "past").length + 1;
      const futureDays = group.days.filter(
        (day) => day.dayStatus === "future"
      ).length;

      return {
        groupId: group._id,
        groupName: group.groupName,
        groupInfo: group.groupInfo,
        teacher: group.teacher,
        firstLastDays: [
          group.days[0].date,
          group.days[group.days.length - 1].date,
        ],
        times: group.times,
        dayNames: group.dayNames,
        dayChart: `${pastDays}/${futureDays}`,
        pastDays,
        futureDays,
      };
    });

    if (!groups || groups.length === 0) {
      return res
        .status(404)
        .json({ message: `Groups not found for the ${role}` });
    }

    return res.status(200).json({ groups: groups });
  } catch (error) {
    console.error(
      `Error retrieving direct group information for the user: ${error}`
    );
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGroupDays = async (req, res) => {
  const groupId = req.params.groupId;

  try {
    // Fetch the days for the given groupId
    const groupDays = await Day.find({ group: groupId });

    // Extract specific details (dayId, date, index, dayStatus) from each day
    const formattedGroupDays = groupDays.map((day) => ({
      dayId: day._id,
      date: day.date,
      index: day.index,
      dayStatus: day.dayStatus,
    }));

    // Respond with the formatted group days
    res.status(200).json({ groupDays: formattedGroupDays });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//დასატესტია
export const addUserPhoto = async (req, res) => {
  try {
    const { userId } = req.user;

    const file = await configureMulter(1)(req, res);

    if (!userId) {
      return res.status(400).json({ error: "User ID not found" });
    }

    if (!file || file.length === 0) {
      console.error("No file found in the request.");
      return res.status(400).json({ error: "No files found in the request" });
    }

    const user =
      (await Student.findById(userId)) || (await Teacher.findById(userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const previousPhotoPath = user.photo;

    const filePaths = await uploadFilesToS3([file]);

    // Update the user model with the new S3 file path
    user.photo = filePaths[0]; // Assuming you're using only one file for a photo
    await user.save();

    // If there's a previous photo path, delete it from S3
    if (previousPhotoPath) {
      await deleteFileFromS3(previousPhotoPath);
    }

    return res
      .status(200)
      .json({ success: "Photo added successfully", filePath: filePaths[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

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
