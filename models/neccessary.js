export const registerUser = async (req, res) => {
  const { username, password, email, groupId } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const signedInUserRole = req.user.role;

    // Check if the provided groupId exists in the Group model
    const existingGroup = await Group.findById(groupId);
    if (!existingGroup) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    if (signedInUserRole === "admin") {
      // Check if the teacher already exists
      let existingTeacher = await Teacher.findOne({ username });

      if (existingTeacher) {
        // If teacher exists, add the group to teacher's groups
        if (!existingTeacher.group.includes(groupId)) {
          existingTeacher.group.push(groupId);
          await existingTeacher.save();
        }
        // Assign the teacher to the specified group if not already assigned
        if (!existingGroup.teacher) {
          await Group.findByIdAndUpdate(groupId, {
            $set: { teacher: existingTeacher._id },
          });
        }
        return res.status(200).json({
          message: "Teacher already exists, group added successfully",
        });
      }

      // If teacher doesn't exist, create a new teacher
      const newTeacher = new Teacher({
        username,
        password: hashedPassword,
        email,
        group: [groupId], // Initialize groups array with groupId
      });
      await newTeacher.save();

      // Assign the teacher to the specified group
      await Group.findByIdAndUpdate(groupId, {
        $set: { teacher: newTeacher._id },
      });

      return res.status(201).json({ message: "Teacher created successfully" });
    } else if (signedInUserRole === "teacher") {
      // Check if the student already exists
      let existingStudent = await Student.findOne({ username });

      if (existingStudent) {
        // If student exists, add the group to student's groups
        if (!existingStudent.group.includes(groupId)) {
          existingStudent.group.push(groupId);
          await existingStudent.save();
        }
        // Add the student to the group if not already added
        await Group.findByIdAndUpdate(groupId, {
          $addToSet: { students: existingStudent._id },
        });
        return res.status(200).json({
          message: "Student already exists, group added successfully",
        });
      }

      // If student doesn't exist, create a new student
      const newStudent = new Student({
        username,
        password: hashedPassword,
        group: [groupId], // Initialize groups array with groupId
      });
      await newStudent.save();

      // Add the student to the group
      await Group.findByIdAndUpdate(groupId, {
        $addToSet: { students: newStudent._id },
      });

      return res.status(201).json({ message: "Student created successfully" });
    } else {
      // Unauthorized access
      res.status(403).json({ message: "Permission denied" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    // Internal Server Error
    res.status(500).json({ message: "Internal Server Error" });
  }
};
