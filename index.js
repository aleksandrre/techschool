// Import necessary modules
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoute from "./routes/authRoute.js";
import teacherRoute from "./routes/teacherRoute.js";
import studentRoute from "./routes/studentRoute.js";
import adminRoute from "./routes/adminRoute.js";
import commonRoute from "./routes/commonRoute.js";
import bcrypt from "bcrypt";

import potentialRoute from "./routes/potentialStudentRoute.js";
import { Admin } from "./models/adminModel.js";

const PORT = 3001;
const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/auth", authRoute);
app.use("/student", studentRoute);
app.use("/teacher", teacherRoute);
app.use("/admin", adminRoute);
app.use("/potentialStudent", potentialRoute);
app.use("/common", commonRoute);

// Database connection

mongoose
  .connect(
    // "mongodb://localhost:27017/your_database_name",
    "mongodb+srv://alekochokheli01:iiD4teZWX9XwBy9I@cluster0.ucsj7po.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {}
  )
  .then(() => {
    console.log("Successfully connected to MongoDB");
    // Create an admin instance
    // const newAdmin = new Admin({
    //   username: "chokha",
    //   // Hash the password using bcrypt
    //   password: bcrypt.hashSync("123", 10),
    //   role: "admin",
    // });

    // // Save the admin instance to the database
    // newAdmin
    //   .save()
    //   .then((admin) => {
    //     console.log("Admin created successfully:", admin);
    //     // You can perform additional actions here if needed
    //   })
    //   .catch((error) => {
    //     console.error("Error creating admin:", error);
    //   });
    app.listen(PORT, () => {
      console.log(`App is listening on ${PORT} port`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
