import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaBook, FaTasks, FaUser, FaSignOutAlt, FaTachometerAlt, FaCrown, FaBell, FaSearch, FaUserCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const NavbarComponent = () => {
  const { user, logout, isAdmin, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      style={styles.navbar}
    >
      <div style={styles.navContainer}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" style={styles.navLogo}>
            <span style={styles.logoIcon}>🎓</span>
            <span style={styles.logoText}>EduPortal</span>
          </Link>
        </motion.div>

        <form onSubmit={handleSearch} style={styles.searchForm}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </form>
        
        <div style={styles.navMenu}>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
            <Link to="/dashboard" style={styles.navLink}>
              <FaHome /> Dashboard
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
            <Link to="/courses" style={styles.navLink}>
              <FaBook /> Courses
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
            <Link to="/assignments" style={styles.navLink}>
              <FaTasks /> Assignments
            </Link>
          </motion.div>
          
          {(isTeacher || isAdmin) && (
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link to={isAdmin ? "/admin" : "/teacher"} style={styles.navLink}>
                <FaTachometerAlt /> {isAdmin ? 'Admin' : 'Teacher'}
              </Link>
            </motion.div>
          )}
          
          <div style={styles.navUser}>
            {user?.premiumStatus && (
              <motion.div 
                style={styles.premiumBadge}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <FaCrown /> Premium
              </motion.div>
            )}
            
            <div style={styles.userDropdown} onClick={() => setShowDropdown(!showDropdown)}>
              {/* Profile Picture with fallback */}
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user?.name} 
                  style={styles.avatar} 
                />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
              
              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    style={styles.dropdownMenu}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Link to="/profile" style={styles.dropdownItem}>
                      <FaUser /> My Profile
                    </Link>
                    <Link to="/profile#certificates" style={styles.dropdownItem}>
                      <FaCrown /> My Certificates
                    </Link>
                    <hr style={styles.dropdownDivider} />
                    <button onClick={handleLogout} style={styles.dropdownLogout}>
                      <FaSignOutAlt /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

const styles = {
  navbar: {
    background: 'white',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  logoIcon: { fontSize: '1.8rem' },
  logoText: { 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    WebkitBackgroundClip: 'text', 
    WebkitTextFillColor: 'transparent' 
  },
  searchForm: { flex: 1, maxWidth: '400px', position: 'relative' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' },
  searchInput: {
    width: '100%',
    padding: '10px 10px 10px 35px',
    border: '2px solid #e0e6ed',
    borderRadius: '25px',
    fontSize: '14px',
    transition: 'all 0.3s',
    outline: 'none',
  },
  searchInputFocus: {
    borderColor: '#667eea',
  },
  navMenu: { display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'wrap' },
  navLink: {
    color: '#2c3e50',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'all 0.3s',
  },
  navUser: { position: 'relative' },
  premiumBadge: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginRight: '10px',
  },
  userDropdown: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '30px',
    transition: 'background 0.3s',
  },
  avatar: { 
    width: '40px', 
    height: '40px', 
    borderRadius: '50%', 
    objectFit: 'cover',
    border: '2px solid #667eea',
  },
  avatarPlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  userName: { fontWeight: 500, color: '#2c3e50' },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '10px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    minWidth: '200px',
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    textDecoration: 'none',
    color: '#2c3e50',
    transition: 'background 0.3s',
  },
  dropdownDivider: { margin: '5px 0', borderColor: '#eee' },
  dropdownLogout: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    border: 'none',
    background: 'none',
    color: '#e77c6b',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'left',
  },
};

export default NavbarComponent;