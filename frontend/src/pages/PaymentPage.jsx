import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import NavbarComponent from '../components/NavbarComponent';
import { FaCreditCard, FaLock, FaShieldAlt, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const PaymentPage = () => {
  const { type, id } = useParams();
  const [course, setCourse] = useState(null);
  const [amount, setAmount] = useState(type === 'premium' ? 99.99 : 0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    if (type === 'course' && id) {
      fetchCourse();
    } else {
      setLoading(false);
    }
  }, [type, id]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`${apiUrl}/courses/${id}`);
      setCourse(response.data.course);
      setAmount(response.data.course.price);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Course not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPayment = async () => {
    setProcessing(true);
    try {
      if (type === 'course') {
        // Create mock payment
        await axios.post(`${apiUrl}/payments/create-course-payment`, { courseId: id });
        await axios.post(`${apiUrl}/payments/confirm`, {
          paymentIntentId: `demo_${Date.now()}`,
          amount: amount,
          paymentType: 'course',
          courseId: id,
          demoMode: true
        });
        toast.success('✅ Payment successful! You are now enrolled.');
        setTimeout(() => navigate(`/course/${id}`), 1500);
      } else {
        // Premium payment
        await axios.post(`${apiUrl}/payments/create-premium-payment`);
        await axios.post(`${apiUrl}/payments/confirm`, {
          paymentIntentId: `demo_${Date.now()}`,
          amount: amount,
          paymentType: 'premium',
          demoMode: true
        });
        toast.success('✅ Premium activated! Enjoy all features.');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div>
        <NavbarComponent />
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavbarComponent />
      <div style={styles.container}>
        <div style={styles.paymentCard}>
          <button onClick={() => window.history.back()} style={styles.backButton}>
            <FaArrowLeft /> Back
          </button>
          
          <div style={styles.header}>
            <FaCreditCard style={styles.icon} />
            <h1 style={styles.title}>Secure Checkout</h1>
            <p style={styles.subtitle}>Complete your payment to continue</p>
          </div>

          <div style={styles.orderSummary}>
            <h3 style={styles.summaryTitle}>Order Summary</h3>
            <div style={styles.summaryRow}>
              <span>{type === 'premium' ? 'Premium Membership (Lifetime)' : course?.title}</span>
              <strong>${amount}</strong>
            </div>
            <div style={styles.totalRow}>
              <span>Total</span>
              <strong style={styles.totalAmount}>${amount}</strong>
            </div>
          </div>
          
          <div style={styles.demoInfo}>
            <FaCheckCircle style={styles.demoIcon} />
            <p><strong>🎓 Demo Mode</strong></p>
            <p>This is a demonstration payment. Click "Pay Now" to complete your enrollment.</p>
            <p style={styles.demoNote}>No actual payment will be charged.</p>
          </div>
          
          <button
            onClick={handleDemoPayment}
            disabled={processing}
            style={styles.payButton}
          >
            {processing ? 'Processing...' : `Pay $${amount} (Demo)`}
          </button>

          <div style={styles.securityInfo}>
            <FaLock /> <span>Demo payment - No actual charge</span>
            <FaShieldAlt /> <span>Secure demo environment</span>
          </div>
          
          <div style={styles.guarantee}>
            ✅ 100% Satisfaction Guarantee | 14-Day Money Back
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 20px',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  },
  paymentCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    width: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#7f8c8d',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    transition: 'color 0.3s',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  icon: {
    fontSize: '4rem',
    color: '#6c7fa8',
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
  orderSummary: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '25px',
  },
  summaryTitle: {
    marginBottom: '15px',
    color: '#2c3e50',
    fontSize: '1.1rem',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #e0e6ed',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 0 0 0',
    marginTop: '10px',
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: '1.3rem',
    color: '#6c7fa8',
  },
  demoInfo: {
    background: '#e8f4f8',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '25px',
    textAlign: 'center',
    border: '1px solid #b8d4e3',
  },
  demoIcon: {
    fontSize: '2rem',
    color: '#6c7fa8',
    marginBottom: '10px',
  },
  demoNote: {
    fontSize: '12px',
    color: '#e77c6b',
    marginTop: '8px',
  },
  payButton: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #8b9dcc 0%, #6c7fa8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    marginBottom: '20px',
  },
  securityInfo: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    color: '#7f8c8d',
    fontSize: '0.85rem',
    marginBottom: '15px',
  },
  guarantee: {
    textAlign: 'center',
    padding: '12px',
    background: '#e8f5e9',
    borderRadius: '10px',
    color: '#2e7d32',
    fontSize: '0.85rem',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '1.2rem',
    color: '#7f8c8d',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e0e6ed',
    borderTop: '4px solid #6c7fa8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Add keyframe animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default PaymentPage;