// groupModel.js

import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
    unique: true,
  },
  groupInfo: {
    type: String,
  },
  times: {
    type: [String],
  },
  dayNames: {
    type: [String],
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    default: null,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  days: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Day",
    },
  ],
});

export const Group = mongoose.model("group", groupSchema);
