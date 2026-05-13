import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRouteComponent from './components/PrivateRouteComponent';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AssignmentsPage from './pages/AssignmentsPage';
import PaymentPage from './pages/PaymentPage';
import AdminPanelPage from './pages/AdminPanelPage';
import TeacherPanelPage from './pages/TeacherPanelPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<PrivateRouteComponent><DashboardPage /></PrivateRouteComponent>} />
          <Route path="/dashboard" element={<PrivateRouteComponent><DashboardPage /></PrivateRouteComponent>} />
          <Route path="/courses" element={<PrivateRouteComponent><CoursesPage /></PrivateRouteComponent>} />
          <Route path="/course/:id" element={<PrivateRouteComponent><CourseDetailPage /></PrivateRouteComponent>} />
          <Route path="/assignments" element={<PrivateRouteComponent><AssignmentsPage /></PrivateRouteComponent>} />
          <Route path="/payment/:type/:id?" element={<PrivateRouteComponent><PaymentPage /></PrivateRouteComponent>} />
          <Route path="/admin" element={<PrivateRouteComponent adminOnly><AdminPanelPage /></PrivateRouteComponent>} />
          <Route path="/teacher" element={<PrivateRouteComponent teacherOnly><TeacherPanelPage /></PrivateRouteComponent>} />
          <Route path="/profile" element={<PrivateRouteComponent><ProfilePage /></PrivateRouteComponent>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;