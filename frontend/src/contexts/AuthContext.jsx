import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // ✅ CHANGE THIS TO PORT 5001
  const API_URL = 'http://localhost:5001/api';
  
  console.log('API URL:', API_URL);

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Load user error:', error);
      localStorage.removeItem('token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registering:', userData);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      console.log('Register success:', response.data);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
      setUser(user);
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      console.log('Register error:', error.message);
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Logging in:', email);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      console.log('Login success:', response.data);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    } catch (error) {
      console.log('Login error:', error.message);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  };

  // ✅ Add this function to update user data
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUser,  // ✅ Add this to the value object
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isTeacher: user?.role === 'teacher' || user?.role === 'admin',
      isStudent: user?.role === 'student'
    }}>
      {children}
    </AuthContext.Provider>
  );
};