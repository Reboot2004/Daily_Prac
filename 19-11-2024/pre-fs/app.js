const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Connect to MongoDB
mongoose.connect("mongodb+srv://<username>:<password>@cluster0.lz5ln4u.mongodb.net/studentsDB", {
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
            res.status(200).json({ message: "Student updated successfully", updatedStudent });
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (err) {
        res.status(400).json({ message: "Failed to update student", error: err });
    }
});

// D. Fetch a student by rollNo (GET)
app.get("/student/:rollNo", async (req, res) => {
    const rollNo = req.params.rollNo;
    try {
        const student = await Student.findOne({ rollNo });
        if (student) {
            res.status(200).json(student);
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error fetching student data", error: err });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
