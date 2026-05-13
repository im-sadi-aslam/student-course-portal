import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaBook, FaChartLine } from 'react-icons/fa';
import NavbarComponent from '../components/NavbarComponent';

const TeacherPanelPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: 0,
    isPremium: false,
    category: 'Programming',
    duration: '',
    level: 'Beginner'
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, assignmentsRes] = await Promise.all([
        axios.get(`${apiUrl}/courses`),
        axios.get(`${apiUrl}/assignments`)
      ]);
      setCourses(coursesRes.data.courses || []);
      setAssignments(assignmentsRes.data.assignments || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/courses`, newCourse);
      toast.success('Course created successfully!');
      setShowCreateModal(false);
      setNewCourse({
        title: '',
        description: '',
        price: 0,
        isPremium: false,
        category: 'Programming',
        duration: '',
        level: 'Beginner'
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Creation failed');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`${apiUrl}/courses/${courseId}`);
        toast.success('Course deleted successfully');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const myCourses = courses.filter(c => c.instructor?._id === user?.id || c.instructor === user?.id);
  const myAssignments = assignments.filter(a => a.createdBy === user?.id);

  if (loading) {
    return (
      <div>
        <NavbarComponent />
        <div style={styles.loading}>Loading teacher panel...</div>
      </div>
    );
  }

  return (
    <div>
      <NavbarComponent />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Teacher Dashboard</h1>
          <p style={styles.subtitle}>Manage your courses and track student progress</p>
          <button onClick={() => setShowCreateModal(true)} style={styles.createButton}>
            <FaPlus /> Create New Course
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <FaBook style={styles.statIcon} />
            <div>
              <h3 style={styles.statNumber}>{myCourses.length}</h3>
              <p style={styles.statLabel}>My Courses</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <FaUsers style={styles.statIcon} />
            <div>
              <h3 style={styles.statNumber}>
                {myCourses.reduce((total, course) => total + (course.enrolledStudents?.length || 0), 0)}
              </h3>
              <p style={styles.statLabel}>Total Students</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <FaChartLine style={styles.statIcon} />
            <div>
              <h3 style={styles.statNumber}>{myAssignments.length}</h3>
              <p style={styles.statLabel}>Assignments</p>
            </div>
          </div>
        </div>

        {/* My Courses */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📚 My Courses</h2>
          <div style={styles.coursesGrid}>
            {myCourses.length === 0 ? (
              <div style={styles.emptyState}>
                <p>You haven't created any courses yet.</p>
                <button onClick={() => setShowCreateModal(true)} style={styles.emptyButton}>
                  Create Your First Course
                </button>
              </div>
            ) : (
              myCourses.map((course) => (
                <div key={course._id} style={styles.courseCard}>
                  <h3>{course.title}</h3>
                  <p>{course.description.substring(0, 100)}...</p>
                  <div style={styles.courseMeta}>
                    <span>💰 ${course.price}</span>
                    <span>🎓 {course.enrolledStudents?.length || 0} students</span>
                    <span>📊 {course.level}</span>
                  </div>
                  <div style={styles.courseActions}>
                    <button onClick={() => handleDeleteCourse(course._id)} style={styles.deleteButton}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create New Course</h2>
            <form onSubmit={handleCreateCourse} style={styles.modalForm}>
              <input
                type="text"
                placeholder="Course Title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                required
                style={styles.modalInput}
              />
              <textarea
                placeholder="Course Description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                required
                style={styles.modalTextarea}
              />
              <input
                type="number"
                placeholder="Price ($)"
                value={newCourse.price}
                onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) })}
                required
                style={styles.modalInput}
              />
              <select
                value={newCourse.category}
                onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                style={styles.modalSelect}
              >
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
                <option value="Data Science">Data Science</option>
              </select>
              <input
                type="text"
                placeholder="Duration (e.g., 10 weeks)"
                value={newCourse.duration}
                onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                required
                style={styles.modalInput}
              />
              <select
                value={newCourse.level}
                onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                style={styles.modalSelect}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={newCourse.isPremium}
                  onChange={(e) => setNewCourse({ ...newCourse, isPremium: e.target.checked })}
                />
                Premium Course
              </label>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.createButtonModal}>
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.5rem',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#7f8c8d',
    marginBottom: '20px',
  },
  createButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #8b9dcc 0%, #6c7fa8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 600,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
  },
  statIcon: {
    fontSize: '3rem',
    color: '#8b9dcc',
  },
  statNumber: {
    fontSize: '2rem',
    color: '#2c3e50',
    margin: 0,
  },
  statLabel: {
    color: '#7f8c8d',
    margin: 0,
  },
  section: {
    marginTop: '40px',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    color: '#2c3e50',
    marginBottom: '20px',
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '25px',
  },
  courseCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
    transition: 'transform 0.3s ease',
  },
  courseMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px',
    marginBottom: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e0e6ed',
    color: '#7f8c8d',
  },
  courseActions: {
    display: 'flex',
    gap: '10px',
  },
  deleteButton: {
    padding: '8px 16px',
    background: '#e77c6b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '16px',
  },
  emptyButton: {
    marginTop: '20px',
    padding: '10px 20px',
    background: '#8b9dcc',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '1.2rem',
    color: '#7f8c8d',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalTitle: {
    marginBottom: '20px',
    color: '#2c3e50',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  modalInput: {
    padding: '12px',
    border: '2px solid #e0e6ed',
    borderRadius: '8px',
    fontSize: '14px',
  },
  modalTextarea: {
    padding: '12px',
    border: '2px solid #e0e6ed',
    borderRadius: '8px',
    fontSize: '14px',
    minHeight: '100px',
  },
  modalSelect: {
    padding: '12px',
    border: '2px solid #e0e6ed',
    borderRadius: '8px',
    fontSize: '14px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    background: '#e0e6ed',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  createButtonModal: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #8b9dcc 0%, #6c7fa8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default TeacherPanelPage;