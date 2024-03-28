// controllers/groupController.js

import { Group } from "../models/groupModel.js";
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
  } = req.body;
  console.log(syllabus + "admin");
  try {
    const existingGroup = await Group.findOne({ groupName });

    if (existingGroup) {
      return res.status(400).json({ message: "Group name already exists" });
    }

    const newGroup = new Group({
      groupName,
      times: times,
      dayNames: dayNames,
    });

    await createDays(
      newGroup,
      intervalsInDays,
      new Date(startingDateWithTime),
      daysLeft,
      dayOff,
      times,
      dayNames,
      syllabus
    );

    await newGroup.save();

    return res.status(200).json({ savedGroup: newGroup });
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
