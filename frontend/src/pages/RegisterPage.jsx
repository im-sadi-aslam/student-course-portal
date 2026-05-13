import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaGraduationCap, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    
    setLoading(true);
    const success = await register({ name, email, password });
    setLoading(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={styles.container}>
      <motion.div 
        style={styles.card}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={styles.header}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <FaGraduationCap style={styles.logo} />
          </motion.div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join us and start learning today</p>
        </div>
        
        {error && <div style={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrapper}>
              <FaUser style={styles.inputIcon} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={styles.input}
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <FaEnvelope style={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <FaLock style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="Create a password (min 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrapper}>
              <FaLock style={styles.inputIcon} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <motion.button 
            type="submit" 
            style={styles.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </motion.button>
        </form>

        <div style={styles.footer}>
          <p>Already have an account? <Link to="/login" style={styles.link}>Login here</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  card: {
    maxWidth: '450px',
    width: '100%',
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logo: {
    fontSize: '3rem',
    color: '#667eea',
    marginBottom: '15px',
  },
  title: {
    fontSize: '1.8rem',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#7f8c8d',
  },
  errorMessage: {
    background: '#e77c6b',
    color: 'white',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: 500,
    color: '#2c3e50',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#7f8c8d',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '2px solid #e0e6ed',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#7f8c8d',
  },
  button: {
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e6ed',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 500,
  },
};

export default RegisterPage;