import Assignment from '../models/AssignmentModel.js';
import Course from '../models/CourseModel.js';
import User from '../models/UserModel.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get all assignments
export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('course', 'title')
      .populate('createdBy', 'name')
      .populate('submissions.student', 'name email')
      .sort('-createdAt');
    
    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single assignment
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title')
      .populate('createdBy', 'name');
    
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create assignment
export const createAssignment = async (req, res) => {
  try {
    const { title, description, course, dueDate, totalMarks } = req.body;
    
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const assignment = await Assignment.create({
      title,
      description,
      course,
      createdBy: req.user.id,
      dueDate,
      totalMarks: totalMarks || 100
    });
    
    res.status(201).json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit assignment
export const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    // Check if already submitted
    const alreadySubmitted = assignment.submissions.find(
      s => s.student.toString() === req.user.id
    );
    
    if (alreadySubmitted) {
      return res.status(400).json({ success: false, message: 'Already submitted' });
    }
    
    let fileUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'assignments' });
      fileUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }
    
    assignment.submissions.push({
      student: req.user.id,
      fileUrl,
      submittedAt: new Date(),
      status: 'pending'
    });
    
    await assignment.save();
    
    res.json({ success: true, message: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Grade assignment
export const gradeAssignment = async (req, res) => {
  try {
    const { studentId, marks, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    const submission = assignment.submissions.find(
      s => s.student.toString() === studentId
    );
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = 'graded';
    
    await assignment.save();
    
    res.json({ success: true, message: 'Assignment graded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};