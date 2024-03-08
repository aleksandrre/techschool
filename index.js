// Import necessary modules
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoute from "./routes/authRoute.js";
import teacherRoute from "./routes/teacherRoute.js";
import studentRoute from "./routes/studentRoute.js";
import adminRoute from "./routes/adminRoute.js";
import commonRoute from "./routes/commonRoute.js";

// import informationRoute from "./routes/informationRoute.js";
import potentialRoute from "./routes/potentialStudentRoute.js";

const PORT = 3001;
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoute);
app.use("/student", studentRoute);
app.use("/teacher", teacherRoute);
app.use("/admin", adminRoute);
// app.use("/info", informationRoute);
app.use("/potentialStudent", potentialRoute);
app.use("/common", commonRoute);

// Database connection
mongoose
  .connect("mongodb://localhost:27017/school", {})
  .then(() => {
    console.log("Successfully connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`App is listening on ${PORT} port`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
