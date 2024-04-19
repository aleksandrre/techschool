import mongoose from "mongoose";

const potentialStudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  courseName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  promoCode: {
    type: String,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
  },
});

export const PotentialStudent = mongoose.model(
  "PotentialStudent",
  potentialStudentSchema
);
