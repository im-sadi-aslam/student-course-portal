import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUpload, FaCheckCircle, FaClock, FaDownload, FaGraduationCap } from 'react-icons/fa';
import NavbarComponent from '../components/NavbarComponent';

const AssignmentsPage = () => {
  const { user, isTeacher, isAdmin } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    course: '',
    dueDate: '',
    totalMarks: 100
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, coursesRes] = await Promise.all([
        axios.get(`${apiUrl}/assignments`),
        axios.get(`${apiUrl}/courses`)
      ]);
      setAssignments(assignmentsRes.data.assignments || []);
      setCourses(coursesRes.data.courses || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setSubmitting(true);
    try {
      await axios.post(`${apiUrl}/assignments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Assignment submitted successfully!');
      setSelectedFile(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/assignments`, newAssignment);
      toast.success('Assignment created successfully!');
      setShowCreateModal(false);
      setNewAssignment({ title: '', description: '', course: '', dueDate: '', totalMarks: 100 });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Creation failed');
    }
  };

  const isSubmitted = (assignmentId) => {
    const assignment = assignments.find(a => a._id === assignmentId);
    return assignment?.submissions?.some(s => s.student?._id === user?.id);
  };

  if (loading) {
    return (
      <div>
        <NavbarComponent />
        <div style={styles.loading}>Loading assignments...</div>
      </div>
    );
  }

  return (
    <div>
      <NavbarComponent />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📋 Assignments</h1>
          <p style={styles.subtitle}>Submit your work and track your progress</p>
          {(isTeacher || isAdmin) && (
            <button onClick={() => setShowCreateModal(true)} style={styles.createButton}>
              + Create Assignment
            </button>
          )}
        </div>

        <div style={styles.assignmentsGrid}>
          {assignments.length === 0 ? (
            <div style={styles.emptyState}>
              <FaGraduationCap style={styles.emptyIcon} />
              <p>No assignments available yet.</p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment._id} style={styles.assignmentCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.assignmentTitle}>{assignment.title}</h3>
                  {isSubmitted(assignment._id) && (
                    <span style={styles.submittedBadge}>
                      <FaCheckCircle /> Submitted
                    </span>
                  )}
                </div>
                <p style={styles.description}>{assignment.description}</p>
                <div style={styles.metaInfo}>
                  <span><FaClock /> Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  <span>📊 Total Marks: {assignment.totalMarks}</span>
                  <span>📚 Course: {assignment.course?.title || 'N/A'}</span>
                </div>
                
                {!isSubmitted(assignment._id) && user?.role === 'student' && (
                  <div style={styles.submitSection}>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                      style={styles.fileInput}
                    />
                    <button
                      onClick={() => handleSubmitAssignment(assignment._id)}
                      disabled={submitting || !selectedFile}
                      style={styles.submitButton}
                    >
                      <FaUpload /> {submitting ? 'Submitting...' : 'Submit Assignment'}
                    </button>
                  </div>
                )}

                {(isTeacher || isAdmin) && assignment.submissions?.length > 0 && (
                  <div style={styles.submissionsList}>
                    <h4>Submissions ({assignment.submissions.length})</h4>
                    {assignment.submissions.map((sub, idx) => (
                      <div key={idx} style={styles.submissionItem}>
                        <span>{sub.student?.name || 'Student'}</span>
                        <span style={sub.status === 'graded' ? styles.graded : styles.pending}>
                          {sub.status === 'graded' ? `Marks: ${sub.marks}` : 'Pending'}
                        </span>
                        {sub.fileUrl && (
                          <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" style={styles.downloadLink}>
                            <FaDownload /> View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create New Assignment</h2>
            <form onSubmit={handleCreateAssignment} style={styles.modalForm}>
              <input
                type="text"
                placeholder="Assignment Title"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                required
                style={styles.modalInput}
              />
              <textarea
                placeholder="Description"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                required
                style={styles.modalTextarea}
              />
              <select
                value={newAssignment.course}
                onChange={(e) => setNewAssignment({ ...newAssignment, course: e.target.value })}
                required
                style={styles.modalSelect}
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                required
                style={styles.modalInput}
              />
              <input
                type="number"
                placeholder="Total Marks"
                value={newAssignment.totalMarks}
                onChange={(e) => setNewAssignment({ ...newAssignment, totalMarks: parseInt(e.target.value) })}
                required
                style={styles.modalInput}
              />
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.createButtonModal}>
                  Create Assignment
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '2.5rem',
    color: '#2c3e50',
  },
  subtitle: {
    color: '#7f8c8d',
    marginTop: '10px',
  },
  createButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #8b9dcc 0%, #6c7fa8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  assignmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '25px',
  },
  assignmentCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  assignmentTitle: {
    fontSize: '1.3rem',
    color: '#2c3e50',
  },
  submittedBadge: {
    background: '#89c4a3',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  description: {
    color: '#7f8c8d',
    marginBottom: '15px',
    lineHeight: '1.5',
  },
  metaInfo: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e0e6ed',
    color: '#7f8c8d',
    fontSize: '0.9rem',
  },
  submitSection: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  fileInput: {
    flex: 1,
    padding: '8px',
    border: '1px solid #e0e6ed',
    borderRadius: '8px',
  },
  submitButton: {
    padding: '10px 20px',
    background: '#8b9dcc',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  submissionsList: {
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #e0e6ed',
  },
  submissionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginTop: '10px',
  },
  graded: {
    color: '#89c4a3',
    fontWeight: 500,
  },
  pending: {
    color: '#f7d794',
  },
  downloadLink: {
    color: '#6c7fa8',
    textDecoration: 'none',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '16px',
  },
  emptyIcon: {
    fontSize: '4rem',
    color: '#8b9dcc',
    marginBottom: '15px',
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

export default AssignmentsPage;