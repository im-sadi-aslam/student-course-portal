import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaUser, FaEnvelope, FaCamera, FaDownload, FaCertificate, 
  FaPrint, FaEdit, FaSave, FaTimes, FaPhone, FaMapMarkerAlt,
  FaBriefcase, FaGraduationCap, FaCode, FaLinkedin, FaGithub, FaTwitter,
  FaSpinner, FaCheckCircle, FaClock, FaStar, FaTrophy, FaBook
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import NavbarComponent from '../components/NavbarComponent';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/auth/me`);
      setProfile(response.data.user);
      setEnrolledCourses(response.data.user.enrolledCourses || []);
      if (updateUser) {
        updateUser(response.data.user);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    setUploading(true);
    try {
      const response = await axios.post(`${apiUrl}/auth/upload-profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const updatedProfile = { ...profile, profilePicture: response.data.imageUrl };
      setProfile(updatedProfile);
      if (updateUser) {
        updateUser(updatedProfile);
      }
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${apiUrl}/auth/update-profile`, {
        name: profile.name,
        bio: profile.bio,
        phone: profile.phone,
        address: profile.address,
        occupation: profile.occupation,
        education: profile.education,
        skills: profile.skills,
        socialLinks: profile.socialLinks
      });
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchUserData();
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    const newSkill = prompt('Enter your skill:');
    if (newSkill && !profile?.skills?.includes(newSkill)) {
      setProfile({
        ...profile,
        skills: [...(profile?.skills || []), newSkill]
      });
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile?.skills?.filter(skill => skill !== skillToRemove)
    });
  };

  const handlePrintCertificate = (course) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate of Completion - ${course.title}</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            .certificate { 
              width: 100%;
              height: 100%;
              page-break-after: avoid;
              page-break-inside: avoid;
            }
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            background: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
          .certificate {
            width: 800px;
            background: white;
            border: 15px solid #667eea;
            padding: 50px;
            text-align: center;
            position: relative;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          .certificate h1 {
            font-size: 48px;
            color: #667eea;
            margin-top: 20px;
          }
          .certificate h2 {
            font-size: 28px;
            margin: 20px 0;
            color: #333;
          }
          .certificate p {
            font-size: 18px;
            margin: 15px 0;
            color: #666;
          }
          .student-name {
            font-size: 36px;
            font-weight: bold;
            color: #764ba2;
            margin: 30px 0;
            text-transform: uppercase;
          }
          .course-name {
            font-size: 28px;
            color: #667eea;
            margin: 20px 0;
            font-weight: bold;
          }
          .date {
            margin-top: 40px;
            color: #666;
          }
          .signature {
            margin-top: 50px;
            border-top: 2px solid #333;
            display: inline-block;
            padding-top: 15px;
            width: 250px;
            font-size: 14px;
          }
          .seal {
            position: absolute;
            bottom: 50px;
            right: 50px;
            width: 100px;
            height: 100px;
            border: 3px solid #667eea;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #667eea;
          }
          .grade {
            font-size: 20px;
            color: #f093fb;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>🎓 CERTIFICATE OF COMPLETION</h1>
          <p>This certificate is proudly presented to</p>
          <div class="student-name">${profile?.name}</div>
          <p>for successfully completing the course</p>
          <div class="course-name">"${course.title}"</div>
          <p>with outstanding performance and dedication.</p>
          <div class="grade">🌟 Grade: A+ 🌟</div>
          <div class="date">Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div class="signature">Authorized Signature</div>
          <div class="seal">EduPortal<br>Official Seal</div>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <NavbarComponent />
      <div style={styles.container}>
        <motion.div 
          style={styles.profileHeader}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={styles.avatarSection}>
            <div style={styles.avatarContainer}>
              {profile?.profilePicture ? (
                <img src={profile.profilePicture} alt={profile?.name} style={styles.avatar} />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  {profile?.name?.charAt(0) || 'U'}
                </div>
              )}
              <label style={styles.cameraIcon}>
                {uploading ? <FaSpinner className="spin" /> : <FaCamera />}
                <input type="file" accept="image/*" onChange={handleImageUpload} hidden disabled={uploading} />
              </label>
            </div>
            <h1 style={styles.userName}>{profile?.name}</h1>
            <p style={styles.userEmail}>{profile?.email}</p>
            <div style={styles.badge}>
              {profile?.premiumStatus ? '👑 Premium Member' : '⭐ Free Member'}
            </div>
            {profile?.bio && <p style={styles.userBio}>{profile.bio}</p>}
          </div>
        </motion.div>

        <motion.div 
          style={styles.statsGrid}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div style={styles.statCard}>
            <FaBook style={styles.statIcon} />
            <div>
              <h3>{enrolledCourses.length}</h3>
              <p>Enrolled Courses</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <FaTrophy style={styles.statIcon} />
            <div>
              <h3>{profile?.completedCourses?.length || 0}</h3>
              <p>Completed Courses</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <FaStar style={styles.statIcon} />
            <div>
              <h3>{profile?.totalScore || 0}</h3>
              <p>Total Points</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <FaCertificate style={styles.statIcon} />
            <div>
              <h3>{enrolledCourses.length}</h3>
              <p>Certificates</p>
            </div>
          </div>
        </motion.div>

        {editing ? (
          <motion.form 
            onSubmit={handleUpdateProfile} 
            style={styles.editForm}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 style={styles.formTitle}>Edit Profile</h2>
            
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label><FaUser /> Full Name</label>
                <input
                  type="text"
                  value={profile?.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={styles.input}
                  placeholder="Full Name"
                />
              </div>

              <div style={styles.formGroup}>
                <label><FaPhone /> Phone Number</label>
                <input
                  type="tel"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  style={styles.input}
                  placeholder="Phone Number"
                />
              </div>

              <div style={styles.formGroup}>
                <label><FaMapMarkerAlt /> Address</label>
                <input
                  type="text"
                  value={profile?.address || ''}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  style={styles.input}
                  placeholder="Your Address"
                />
              </div>

              <div style={styles.formGroup}>
                <label><FaBriefcase /> Occupation</label>
                <input
                  type="text"
                  value={profile?.occupation || ''}
                  onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                  style={styles.input}
                  placeholder="Your Occupation"
                />
              </div>

              <div style={styles.formGroup}>
                <label><FaGraduationCap /> Education</label>
                <input
                  type="text"
                  value={profile?.education || ''}
                  onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                  style={styles.input}
                  placeholder="Your Education"
                />
              </div>

              <div style={styles.formGroupFull}>
                <label><FaCode /> Skills</label>
                <div style={styles.skillsContainer}>
                  {profile?.skills?.map((skill, idx) => (
                    <span key={idx} style={styles.skillTag}>
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} style={styles.removeSkill}>×</button>
                    </span>
                  ))}
                  <button type="button" onClick={handleAddSkill} style={styles.addSkillBtn}>
                    + Add Skill
                  </button>
                </div>
              </div>

              <div style={styles.formGroupFull}>
                <label>Bio</label>
                <textarea
                  value={profile?.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  style={styles.textarea}
                  placeholder="Tell us about yourself..."
                  rows="3"
                />
              </div>

              <div style={styles.formGroupFull}>
                <label>Social Links</label>
                <div style={styles.socialLinks}>
                  <input
                    type="url"
                    placeholder="LinkedIn URL"
                    value={profile?.socialLinks?.linkedin || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      socialLinks: { ...profile.socialLinks, linkedin: e.target.value }
                    })}
                    style={styles.socialInput}
                  />
                  <input
                    type="url"
                    placeholder="GitHub URL"
                    value={profile?.socialLinks?.github || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      socialLinks: { ...profile.socialLinks, github: e.target.value }
                    })}
                    style={styles.socialInput}
                  />
                  <input
                    type="url"
                    placeholder="Twitter URL"
                    value={profile?.socialLinks?.twitter || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      socialLinks: { ...profile.socialLinks, twitter: e.target.value }
                    })}
                    style={styles.socialInput}
                  />
                </div>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.saveButton} disabled={loading}>
                <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)} style={styles.cancelButton}>
                <FaTimes /> Cancel
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.button 
            onClick={() => setEditing(true)} 
            style={styles.editButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaEdit /> Edit Profile
          </motion.button>
        )}

        <motion.div 
          style={styles.certificatesSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2>📜 My Certificates & Courses</h2>
          <div style={styles.certificatesGrid}>
            {enrolledCourses.map((course, index) => (
              <motion.div 
                key={course._id} 
                style={styles.certificateCard}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <FaCertificate style={styles.certIcon} />
                <h3>{course.title}</h3>
                <p>Instructor: {course.instructorName}</p>
                <p>Duration: {course.duration}</p>
                <p>Enrolled: {new Date().toLocaleDateString()}</p>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: '75%' }}></div>
                </div>
                <p style={styles.progressText}>75% Complete</p>
                <button onClick={() => handlePrintCertificate(course)} style={styles.printButton}>
                  <FaPrint /> Download Certificate
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  profileHeader: { textAlign: 'center', marginBottom: '40px' },
  avatarSection: { display: 'inline-block' },
  avatarContainer: { position: 'relative', display: 'inline-block' },
  avatar: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 0 20px rgba(0,0,0,0.1)' },
  avatarPlaceholder: { width: '150px', height: '150px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', fontWeight: 'bold' },
  cameraIcon: { position: 'absolute', bottom: '10px', right: '10px', background: '#667eea', padding: '10px', borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' },
  userName: { marginTop: '20px', fontSize: '2rem', color: '#2c3e50' },
  userEmail: { color: '#666', marginBottom: '10px' },
  userBio: { color: '#888', maxWidth: '400px', margin: '10px auto' },
  badge: { display: 'inline-block', padding: '8px 20px', borderRadius: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: 'bold' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' },
  statCard: { background: 'white', borderRadius: '15px', padding: '25px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' },
  statIcon: { fontSize: '2.5rem', color: '#667eea' },
  editForm: { background: 'white', borderRadius: '20px', padding: '30px', marginBottom: '40px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' },
  formTitle: { marginBottom: '25px', color: '#2c3e50', fontSize: '1.5rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  formGroupFull: { gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px' },
  input: { padding: '12px', border: '2px solid #e0e6ed', borderRadius: '10px', fontSize: '14px' },
  textarea: { padding: '12px', border: '2px solid #e0e6ed', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' },
  skillsContainer: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' },
  skillTag: { background: '#667eea', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' },
  removeSkill: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  addSkillBtn: { padding: '5px 15px', background: '#e0e6ed', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' },
  socialLinks: { display: 'flex', flexDirection: 'column', gap: '10px' },
  socialInput: { padding: '10px', border: '2px solid #e0e6ed', borderRadius: '8px', fontSize: '14px' },
  buttonGroup: { display: 'flex', gap: '15px', marginTop: '25px', justifyContent: 'flex-end' },
  saveButton: { padding: '12px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  cancelButton: { padding: '12px 24px', background: '#e0e6ed', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  editButton: { padding: '12px 30px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', marginBottom: '40px', display: 'inline-flex', alignItems: 'center', gap: '8px' },
  certificatesSection: { marginTop: '40px' },
  certificatesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px', marginTop: '20px' },
  certificateCard: { background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s' },
  certIcon: { fontSize: '3rem', color: '#667eea', marginBottom: '15px' },
  progressBar: { height: '8px', background: '#e0e6ed', borderRadius: '4px', margin: '15px 0', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '4px' },
  progressText: { fontSize: '12px', color: '#666', textAlign: 'right', marginTop: '-10px', marginBottom: '15px' },
  printButton: { marginTop: '15px', padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' },
};

export default ProfilePage;