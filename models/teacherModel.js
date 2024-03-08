import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  role: {
    type: String,
    default: "teacher",
    required: true,
  },
  group: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    validate: (v) => Array.isArray(v) && v.length > 0,
  },
});

export const Teacher = mongoose.model("Teacher", teacherSchema);
