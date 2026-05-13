import Course from '../models/CourseModel.js';
import User from '../models/UserModel.js';

// @desc    Get all courses
export const getCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (level && level !== 'All') {
      query.level = level;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single course
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('enrolledStudents', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Enroll in course
export const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    if (course.isPremium && !user.premiumStatus) {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required for this course'
      });
    }

    user.enrolledCourses.push(course._id);
    course.enrolledStudents.push(user._id);

    await user.save();
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create course
export const createCourse = async (req, res) => {
  try {
    req.body.instructor = req.user.id;
    req.body.instructorName = req.user.name;

    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};