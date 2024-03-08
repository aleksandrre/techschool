import mongoose from "mongoose";
const studentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  parentPhone: {
    type: String,
  },
  points: {
    type: Number,
    required: true,
    default: 0,
  },
  role: {
    type: String,
    required: true,
    default: "student",
  },
  group: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
  ],
});

export const Student = mongoose.model("Student", studentSchema);
