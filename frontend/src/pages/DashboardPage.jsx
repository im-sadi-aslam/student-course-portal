import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FaBook, FaTasks, FaTrophy, FaGraduationCap, FaArrowRight } from 'react-icons/fa';
import NavbarComponent from '../components/NavbarComponent';

const DashboardPage = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedAssignments: 0,
    totalMarks: 0
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get(`${apiUrl}/auth/me`);
      setEnrolledCourses(response.data.user.enrolledCourses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  return (
    <div>
      <NavbarComponent />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.welcomeTitle}>Welcome back, {user?.name}! 👋</h1>
          <p style={styles.welcomeText}>Continue your learning journey</p>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <FaBook style={styles.statIcon} />
            <div>
              <h3 style={styles.statNumber}>{enrolledCourses.length}</h3>
              <p style={styles.statLabel}>Enrolled Courses</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <FaTasks style={styles.statIcon} />
            <div>
              <h3 style={styles.statNumber}>{stats.completedAssignments}</h3>
              <p style={styles.statLabel}>Assignments Done</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <FaTrophy style={styles.statIcon} />
            <div>
              <h3 style={styles.statNumber}>{stats.totalMarks}</h3>
              <p style={styles.statLabel}>Total Marks</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <FaGraduationCap style={styles.statIcon} />
            <div>
              <h3 style={styles.statNumber}>{user?.premiumStatus ? 'Premium' : 'Free'}</h3>
              <p style={styles.statLabel}>Subscription</p>
            </div>
          </div>
        </div>

        <div style={styles.coursesSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>My Courses</h2>
            <Link to="/courses" style={styles.browseLink}>
              Browse More <FaArrowRight style={{ marginLeft: '5px' }} />
            </Link>
          </div>
          
          {enrolledCourses.length === 0 ? (
            <div style={styles.emptyState}>
              <p>You haven't enrolled in any courses yet.</p>
              <Link to="/courses" style={styles.button}>Explore Courses</Link>
            </div>
          ) : (
            <div style={styles.coursesGrid}>
              {enrolledCourses.map((course) => (
                <div key={course._id} style={styles.courseCard}>
                  <h3 style={styles.courseTitle}>{course.title}</h3>
                  <p style={styles.courseInstructor}>by {course.instructorName}</p>
                  <Link to={`/course/${course._id}`} style={styles.courseButton}>
                    Continue Learning →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {!user?.premiumStatus && (
          <div style={styles.premiumBanner}>
            <div style={styles.premiumContent}>
              <h3 style={styles.premiumTitle}>✨ Upgrade to Premium ✨</h3>
              <p style={styles.premiumText}>Get access to all premium courses, exclusive content, and priority support</p>
              <Link to="/payment/premium" style={styles.premiumButton}>Upgrade Now →</Link>
            </div>
          </div>
        )}
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
  header: {
    marginBottom: '40px',
  },
  welcomeTitle: {
    fontSize: '2.5rem',
    color: 'var(--text-dark)',
    marginBottom: '10px',
  },
  welcomeText: {
    color: 'var(--text-light)',
    fontSize: '1.1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '50px',
  },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: 'var(--shadow)',
    transition: 'transform 0.3s ease',
  },
  statIcon: {
    fontSize: '3rem',
    color: 'var(--accent-soft)',
  },
  statNumber: {
    fontSize: '2rem',
    color: 'var(--text-dark)',
    margin: 0,
  },
  statLabel: {
    color: 'var(--text-light)',
    margin: 0,
  },
  coursesSection: {
    marginBottom: '50px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  sectionTitle: {
    color: 'var(--text-dark)',
    fontSize: '1.8rem',
  },
  browseLink: {
    color: 'var(--accent-strong)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 500,
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '25px',
  },
  courseCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow)',
    transition: 'all 0.3s ease',
  },
  courseTitle: {
    color: 'var(--text-dark)',
    marginBottom: '10px',
  },
  courseInstructor: {
    color: 'var(--text-light)',
    marginBottom: '20px',
  },
  courseButton: {
    display: 'inline-block',
    padding: '10px 20px',
    background: 'var(--accent-soft)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: 'var(--shadow)',
  },
  button: {
    display: 'inline-block',
    marginTop: '20px',
    padding: '12px 30px',
    background: 'linear-gradient(135deg, #8b9dcc 0%, #6c7fa8 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '10px',
    fontWeight: 500,
  },
  premiumBanner: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
  },
  premiumContent: {
    color: 'white',
  },
  premiumTitle: {
    fontSize: '1.8rem',
    marginBottom: '10px',
  },
  premiumText: {
    marginBottom: '20px',
    fontSize: '1.1rem',
  },
  premiumButton: {
    display: 'inline-block',
    padding: '12px 30px',
    background: 'white',
    color: '#667eea',
    textDecoration: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    transition: 'transform 0.3s ease',
  },
};

export default DashboardPage;