const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Connect to MongoDB
mongoose.connect("mongodb+srv://knssriharshith:Xcom123@cluster0.lz5ln4u.mongodb.net/studentsDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Define Student Schema
const studentSchema = new mongoose.Schema({
    name: String,
    rollNo: { type: String, unique: true },
    scores: {
        Java: Number,
        CPP: Number,
        Python: Number,
        GenAI: Number,
        FSD: Number,
    },
});

// Create Student Model
const Student = mongoose.model("Student", studentSchema);

// Middleware
app.use(express.json());

// A. Insert a new student document (POST)
app.post("/student", async (req, res) => {
    try {
        const { name, rollNo, scores } = req.body;
        const newStudent = new Student({ name, rollNo, scores });
        await newStudent.save();
        res.status(201).json({ message: "Student added successfully", student: newStudent });
    } catch (err) {
        res.status(400).json({ message: "Failed to add student", error: err });
    }
});

// B. Delete a student document using rollNo (DELETE)
// Delete a student document using rollNo (DELETE)
app.delete("/student/:rollNo", async (req, res) => {
    const rollNo = req.params.rollNo;
    try {
        const deletedStudent = await Student.findOneAndDelete({ rollNo });
        if (deletedStudent) {
            res.status(200).json({ message: "Student deleted successfully", deletedStudent });
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (err) {
        res.status(400).json({ message: "Failed to delete student", error: err });
    }
});
// C. Update a student's scores using rollNo (PUT)
app.put("/student/:rollNo", async (req, res) => {
    const rollNo = req.params.rollNo;
    const updatedScores = req.body.scores;
    try {
        const updatedStudent = await Student.findOneAndUpdate(
            { rollNo },
            { scores: updatedScores },
            { new: true }
        );
        if (updatedStudent) {
            res.status(200).json({ message: "Student updated successfully", student: updatedStudent });
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error updating student", error: err });
    }
});

// D. Fetch all students' name, rollNo, and GPA (GET)
app.get("/students", async (req, res) => {
    try {
        const students = await Student.find({}, { name: 1, rollNo: 1, scores: 1 });
        const result = students.map(student => {
            const { Java = 0, CPP = 0, Python = 0, GenAI = 0, FSD = 0 } = student.scores;
            const totalScores = Java + CPP + Python + GenAI + FSD;
            const GPA = (totalScores / 5).toFixed(2);
            return {
                name: student.name,
                rollNo: student.rollNo,
                GPA,
            };
        });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: "Error fetching students", error: err });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
