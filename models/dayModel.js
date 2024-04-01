// models/dayModel.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  status: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const laborSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  laborFilePath: {
    type: [String],
    required: true,
  },
  marks: {
    type: Number,
    default: 0,
  },
});

const daySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  dayTheme: {
    type: String,
  },
  dayThemeText: {
    type: String,
  },
  index: {
    type: Number,
  },
  dayStatus: {
    type: String,
    enum: ["active", "past", "future"],
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group", // Reference to the Group model
  },
  resources: [{ title: String, path: String }],
  attendance: [attendanceSchema],
  homework: {
    teacherFilePath: {
      type: String,
    },
    labors: [laborSchema],
  },
});

export const Day = mongoose.model("Day", daySchema);
