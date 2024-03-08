import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    default: "admin",
    required: true,
  },
});

export const Admin = mongoose.model("Admin", adminSchema);
