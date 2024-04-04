// controllers/groupController.js

import { Group } from "../models/groupModel.js";
import { Teacher } from "../models/teacherModel.js";
import { createDays } from "../utils/adminUtils.js";

export const createGroup = async (req, res) => {
  const {
    groupName,
    intervalsInDays,
    startingDateWithTime,
    daysLeft,
    dayOff,
    times,
    dayNames,
    syllabus,
    groupInfo,
  } = req.body;

  try {
    const existingGroup = await Group.findOne({ groupName });

    if (existingGroup) {
      return res.status(400).json({ message: "Group name already exists" });
    }

    const newGroup = new Group({
      groupName,
      times: times,
      dayNames: dayNames,
      groupInfo: groupInfo,
    });

    await createDays(
      newGroup,
      intervalsInDays,
      new Date(startingDateWithTime),
      daysLeft,
      dayOff,
      times,
      syllabus,
      dayNames
    );

    await newGroup.save();

    return res.status(200).json({ savedGroup: newGroup });
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
//გასატესტია
export const deleteTeacher = async (req, res) => {
  const { groupId, teacherId } = req.params;

  try {
    // Remove the teacher from the group
    await Group.findByIdAndUpdate(groupId, { $pull: { teacher: teacherId } });

    // Delete the teacher model
    await Teacher.findByIdAndDelete(teacherId);

    res.json({
      message: "Teacher deleted successfully from the group and teacher model",
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
