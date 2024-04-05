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
    required: true,
  },
  paid: {
    type: Boolean,
  },
});

export const PotentialStudent = mongoose.model(
  "PotentialStudent",
  potentialStudentSchema
);
