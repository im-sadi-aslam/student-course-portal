import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import NavbarComponent from '../components/NavbarComponent';

const CourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`${apiUrl}/courses/${id}`);
      setCourse(response.data.course);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Course not found');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (course.isPremium && !user.premiumStatus) {
      navigate(`/payment/course/${course._id}`);
      return;
    }

    setEnrolling(true);
    try {
      await axios.post(`${apiUrl}/courses/${id}/enroll`);
      toast.success('Successfully enrolled in course!');
      fetchCourse();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolled = () => {
    return user?.enrolledCourses?.includes(course?._id);
  };

  if (loading) {
    return <div style={styles.loading}>Loading course details...</div>;
  }

  if (!course) {
    return <div style={styles.loading}>Course not found</div>;
  }

  return (
    <div>
      <NavbarComponent />
      <div style={styles.container}>
        <div style={styles.courseHeader}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>{course.title}</h1>
            <div style={styles.metaInfo}>
              <span>👨‍🏫 Instructor: {course.instructorName}</span>
              <span>📚 Category: {course.category}</span>
              <span>📊 Level: {course.level}</span>
              <span>⏱️ Duration: {course.duration}</span>
            </div>
            {course.isPremium && (
              <div style={styles.premiumTag}>⭐ Premium Course</div>
            )}
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.mainContent}>
            <div style={styles.section}>
              <h2>About This Course</h2>
              <p style={styles.description}>{course.description}</p>
            </div>

            <div style={styles.section}>
              <h2>What You'll Learn</h2>
              <ul style={styles.learningList}>
                <li>✓ Comprehensive understanding of {course.title}</li>
                <li>✓ Practical hands-on projects</li>
                <li>✓ Real-world applications</li>
                <li>✓ Expert tips and best practices</li>
              </ul>
            </div>

            <div style={styles.section}>
              <h2>Course Curriculum</h2>
              <div style={styles.curriculum}>
                <div style={styles.curriculumItem}>📹 Introduction to {course.title}</div>
                <div style={styles.curriculumItem}>📹 Core Concepts & Fundamentals</div>
                <div style={styles.curriculumItem}>📹 Advanced Topics</div>
                <div style={styles.curriculumItem}>📹 Final Project</div>
              </div>
            </div>
          </div>

          <div style={styles.sidebar}>
            <div style={styles.priceCard}>
              <h3 style={styles.price}>${course.price}</h3>
              {isEnrolled() ? (
                <div style={styles.enrolledMessage}>
                  ✅ You are enrolled in this course
                  <button style={styles.startButton} onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <button
                  style={styles.enrollButton}
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? 'Processing...' : (course.isPremium && !user.premiumStatus ? 'Purchase Course' : 'Enroll Now')}
                </button>
              )}
              <div style={styles.courseIncludes}>
                <p>🎓 Full lifetime access</p>
                <p>📱 Access on mobile and desktop</p>
                <p>🏆 Certificate of completion</p>
                <p>💬 24/7 Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '1.2rem',
    color: 'var(--text-light)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    padding: '40px',
    marginBottom: '40px',
    color: 'white',
  },
  headerContent: {
    maxWidth: '800px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '20px',
  },
  metaInfo: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '20px',
    fontSize: '0.95rem',
  },
  premiumTag: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.2)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 600,
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  section: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow)',
  },
  description: {
    lineHeight: '1.6',
    color: 'var(--text-light)',
  },
  learningList: {
    listStyle: 'none',
    padding: 0,
  },
  curriculum: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  curriculumItem: {
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    color: 'var(--text-dark)',
  },
  sidebar: {
    position: 'sticky',
    top: '100px',
    alignSelf: 'start',
  },
  priceCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow-hover)',
    textAlign: 'center',
  },
  price: {
    fontSize: '2.5rem',
    color: 'var(--accent-strong)',
    marginBottom: '20px',
  },
  enrollButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #8b9dcc 0%, #6c7fa8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '20px',
  },
  enrolledMessage: {
    marginBottom: '20px',
  },
  startButton: {
    width: '100%',
    padding: '12px',
    background: '#89c4a3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  courseIncludes: {
    textAlign: 'left',
    paddingTop: '20px',
    borderTop: '1px solid #e0e6ed',
  },
};

export default CourseDetailPage;