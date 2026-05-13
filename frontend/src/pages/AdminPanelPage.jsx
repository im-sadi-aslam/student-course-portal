import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUsers, FaBook, FaMoneyBill, FaChartLine, FaTrash, FaEdit, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import NavbarComponent from '../components/NavbarComponent';

const AdminPanelPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    premiumUsers: 0,
    students: 0,
    teachers: 0,
    totalRevenue: 0
  });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [statsRes, usersRes, coursesRes, paymentsRes] = await Promise.all([
        axios.get(`${apiUrl}/admin/stats`),
        axios.get(`${apiUrl}/admin/users`),
        axios.get(`${apiUrl}/courses`),
        axios.get(`${apiUrl}/payments/all`)
      ]);
      
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setCourses(coursesRes.data.courses);
      setPayments(paymentsRes.data.payments || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`${apiUrl}/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated successfully');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${apiUrl}/admin/users/${userId}`);
        toast.success('User deleted successfully');
        fetchAllData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const chartData = payments.map(p => ({
    month: new Date(p.createdAt).toLocaleDateString('default', { month: 'short' }),
    amount: p.amount
  })).slice(-6);

  const pieData = [
    { name: 'Students', value: stats.students },
    { name: 'Teachers', value: stats.teachers },
    { name: 'Premium Users', value: stats.premiumUsers }
  ];

  const COLORS = ['#8b9dcc', '#6c7fa8', '#89c4a3'];

  if (loading) {
    return (
      <div>
        <NavbarComponent />
        <div style={styles.loading}>Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div>
      <NavbarComponent />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Manage users, courses, and monitor platform activity</p>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <FaUsers style={styles.statIcon} />
            <div>
              <h3 style={styles.statNumber}>{stats.totalUsers}</h3>
              <p style={styles.statLabel}>Total Users</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <FaBook style={styles.statIcon} />
            <div>
              <h3 style={styles.statNumber}>{stats.totalCourses}</h3>
              <p style={styles.statLabel}>Total Courses</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <FaMoneyBill style={styles.statIcon} />
            <div>
              <h3 style={styles.statNumber}>${stats.totalRevenue}</h3>
              <p style={styles.statLabel}>Total Revenue</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <FaChartLine style={styles.statIcon} />
            <div>
              <h3 style={styles.statNumber}>{Math.round((stats.premiumUsers / stats.totalUsers) * 100)}%</h3>
              <p style={styles.statLabel}>Premium Rate</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setSelectedTab('overview')}
            style={{ ...styles.tab, ...(selectedTab === 'overview' ? styles.activeTab : {}) }}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('users')}
            style={{ ...styles.tab, ...(selectedTab === 'users' ? styles.activeTab : {}) }}
          >
            Users Management
          </button>
          <button
            onClick={() => setSelectedTab('courses')}
            style={{ ...styles.tab, ...(selectedTab === 'courses' ? styles.activeTab : {}) }}
          >
            Courses Management
          </button>
        </div>

        {selectedTab === 'overview' && (
          <div style={styles.overview}>
            <div style={styles.chartsGrid}>
              <div style={styles.chartCard}>
                <h3>Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#8b9dcc" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.chartCard}>
                <h3>User Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'users' && (
          <div style={styles.usersTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Premium</th>
                  <th>Enrolled Courses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                        style={styles.roleSelect}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{u.premiumStatus ? '✅ Yes' : '❌ No'}</td>
                    <td>{u.enrolledCourses?.length || 0}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        style={styles.deleteButton}
                        disabled={u._id === user?.id}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedTab === 'courses' && (
          <div style={styles.coursesGrid}>
            {courses.map((course) => (
              <div key={course._id} style={styles.courseCard}>
                <h3>{course.title}</h3>
                <p>{course.description.substring(0, 100)}...</p>
                <div style={styles.courseStats}>
                  <span>👨‍🏫 {course.instructorName}</span>
                  <span>📚 {course.enrolledStudents?.length || 0} students</span>
                  <span>💰 ${course.price}</span>
                </div>
              </div>
            ))}
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
  title: {
    fontSize: '2.5rem',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#7f8c8d',
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
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: '2px solid #e0e6ed',
  },
  tab: {
    padding: '12px 24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
    color: '#7f8c8d',
  },
  activeTab: {
    color: '#6c7fa8',
    borderBottom: '2px solid #6c7fa8',
    marginBottom: '-2px',
  },
  overview: {
    marginTop: '20px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '30px',
  },
  chartCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
  },
  usersTable: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'auto',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  roleSelect: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #e0e6ed',
  },
  deleteButton: {
    padding: '6px 12px',
    background: '#e77c6b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  },
  courseCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
  },
  courseStats: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e0e6ed',
    color: '#7f8c8d',
    fontSize: '0.9rem',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '1.2rem',
    color: '#7f8c8d',
  },
};

export default AdminPanelPage;