import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaFilter, FaStar, FaClock, FaUserGraduate, FaDollarSign } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import NavbarComponent from '../components/NavbarComponent';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('all');
  const [level, setLevel] = useState('All');
  const { user } = useAuth();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const categories = ['All', 'Programming', 'Design', 'Business', 'Marketing', 'Data Science'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, category, priceRange, level, courses]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${apiUrl}/courses`);
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];
    if (searchTerm) {
      filtered = filtered.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (category !== 'All') {
      filtered = filtered.filter(c => c.category === category);
    }
    if (level !== 'All') {
      filtered = filtered.filter(c => c.level === level);
    }
    if (priceRange === 'free') {
      filtered = filtered.filter(c => c.price === 0);
    } else if (priceRange === 'paid') {
      filtered = filtered.filter(c => c.price > 0);
    }
    setFilteredCourses(filtered);
  };

  const isEnrolled = (courseId) => user?.enrolledCourses?.includes(courseId);

  return (
    <div>
      <NavbarComponent />
      <div style={styles.container}>
        {/* Hero Section */}
        <motion.div 
          style={styles.hero}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={styles.heroTitle}>Expand Your Knowledge</h1>
          <p style={styles.heroSubtitle}>Join 10,000+ students learning from industry experts</p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          style={styles.filtersSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div style={styles.searchBar}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search for courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          
          <div style={styles.filterGroup}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={level} onChange={(e) => setLevel(e.target.value)} style={styles.select}>
              {levels.map(l => <option key={l}>{l}</option>)}
            </select>
            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} style={styles.select}>
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </motion.div>

        {/* Courses Grid */}
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Loading amazing courses...</p>
          </div>
        ) : (
          <motion.div 
            style={styles.coursesGrid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence>
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  style={styles.courseCard}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                >
                  {course.isPremium && (
                    <div style={styles.premiumTag}>
                      <FaStar /> PREMIUM
                    </div>
                  )}
                  <div style={styles.courseThumbnail}>
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} style={styles.thumbnailImg} />
                    ) : (
                      <div style={styles.thumbnailPlaceholder}>📚</div>
                    )}
                  </div>
                  <h3 style={styles.courseTitle}>{course.title}</h3>
                  <p style={styles.courseDescription}>{course.description.substring(0, 100)}...</p>
                  <div style={styles.courseStats}>
                    <span><FaUserGraduate /> {course.instructorName}</span>
                    <span><FaClock /> {course.duration}</span>
                  </div>
                  <div style={styles.courseFooter}>
                    <div>
                      {course.price === 0 ? (
                        <span style={styles.freeBadge}>Free</span>
                      ) : (
                        <span style={styles.price}><FaDollarSign />{course.price}</span>
                      )}
                    </div>
                    {isEnrolled(course._id) ? (
                      <Link to={`/course/${course._id}`} style={styles.continueButton}>
                        Continue Learning →
                      </Link>
                    ) : (
                      <Link to={`/course/${course._id}`} style={styles.enrollButton}>
                        Enroll Now
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {filteredCourses.length === 0 && !loading && (
          <motion.div 
            style={styles.emptyState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>No courses found matching your criteria.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' },
  hero: { textAlign: 'center', marginBottom: '50px' },
  heroTitle: { fontSize: '3rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '15px' },
  heroSubtitle: { fontSize: '1.2rem', color: '#666' },
  filtersSection: { display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' },
  searchBar: { flex: 1, position: 'relative', maxWidth: '400px' },
  searchIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' },
  searchInput: { width: '100%', padding: '14px 14px 14px 45px', border: '2px solid #e0e6ed', borderRadius: '12px', fontSize: '16px' },
  filterGroup: { display: 'flex', gap: '15px' },
  select: { padding: '12px 20px', border: '2px solid #e0e6ed', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', background: 'white' },
  coursesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' },
  courseCard: { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s', position: 'relative' },
  premiumTag: { position: 'absolute', top: '15px', right: '15px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', zIndex: 10 },
  courseThumbnail: { height: '200px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  thumbnailImg: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbnailPlaceholder: { fontSize: '4rem' },
  courseTitle: { fontSize: '1.3rem', padding: '20px 20px 10px', color: '#2c3e50' },
  courseDescription: { padding: '0 20px', color: '#666', lineHeight: '1.5', fontSize: '14px' },
  courseStats: { display: 'flex', gap: '15px', padding: '15px 20px', color: '#888', fontSize: '13px', borderTop: '1px solid #eee', marginTop: '10px' },
  courseFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px 20px', borderTop: '1px solid #eee' },
  price: { fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea', display: 'flex', alignItems: 'center' },
  freeBadge: { background: '#89c4a3', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '12px' },
  enrollButton: { padding: '10px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textDecoration: 'none', borderRadius: '25px', fontSize: '14px', fontWeight: '500', transition: 'transform 0.3s' },
  continueButton: { padding: '10px 24px', background: '#89c4a3', color: 'white', textDecoration: 'none', borderRadius: '25px', fontSize: '14px' },
  loading: { textAlign: 'center', padding: '80px' },
  spinner: { width: '50px', height: '50px', border: '4px solid #e0e6ed', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' },
  emptyState: { textAlign: 'center', padding: '80px', color: '#666' },
};

export default CoursesPage;