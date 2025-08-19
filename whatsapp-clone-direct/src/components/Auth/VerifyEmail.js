import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import { applyActionCode, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import WhatsAppLogo from '../../assets/whatsapp-logo.png';

const VerifyEmailContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: var(--app-background);
`;

const VerifyEmailCard = styled.div`
  background-color: var(--sidebar-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 30px;
  text-align: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  
  img {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
  
  h1 {
    font-size: 24px;
    color: var(--primary-color);
    font-weight: 500;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
`;

const StatusIcon = styled.div`
  font-size: 60px;
  margin: 20px 0;
  color: ${props => props.success ? '#4caf50' : '#f44336'};
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  margin-top: 20px;
  
  &:hover {
    background-color: var(--secondary-color);
  }
  
  &:disabled {
    background-color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

const BackToLogin = styled.div`
  text-align: center;
  margin-top: 30px;
  font-size: 14px;
  
  a {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    text-decoration: none;
    
    svg {
      margin-right: 8px;
    }
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
`;

const VerifyEmail = () => {
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract the action code from the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get('oobCode');
    
    if (!oobCode) {
      setError('Invalid verification link. Please request a new one.');
      setVerifying(false);
      return;
    }
    
    // Verify the email
    applyActionCode(auth, oobCode)
      .then(() => {
        setVerified(true);
        setVerifying(false);
        setSuccess('Your email has been verified successfully!');
        
        // Redirect to home after a delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      })
      .catch((err) => {
        console.error('Error verifying email:', err);
        setError('Invalid or expired verification link. Please request a new one.');
        setVerifying(false);
      });
  }, [location, navigate]);
  
  const handleResendVerification = async () => {
    if (!currentUser) {
      setError('You must be logged in to resend verification email.');
      return;
    }
    
    try {
      setLoading(true);
      await sendEmailVerification(currentUser);
      setSuccess('Verification email has been sent! Check your inbox.');
    } catch (err) {
      console.error('Error sending verification email:', err);
      setError(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <VerifyEmailContainer>
      <VerifyEmailCard>
        <Logo>
          <img src={WhatsAppLogo} alt="WhatsApp" />
          <h1>WhatsApp</h1>
        </Logo>
        
        <Title>Email Verification</Title>
        
        {verifying ? (
          <Subtitle>Verifying your email address...</Subtitle>
        ) : verified ? (
          <>
            <StatusIcon success>
              <FaCheckCircle />
            </StatusIcon>
            <Subtitle>Your email has been verified successfully! You can now log in to your account.</Subtitle>
          </>
        ) : (
          <>
            <StatusIcon>
              <FaTimesCircle />
            </StatusIcon>
            <Subtitle>
              {error || 'We couldn\'t verify your email. The link may have expired or is invalid.'}
            </Subtitle>
            
            {currentUser && !currentUser.emailVerified && (
              <Button onClick={handleResendVerification} disabled={loading}>
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            )}
          </>
        )}
        
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <BackToLogin>
          <Link to="/login">
            <FaArrowLeft />
            Back to login
          </Link>
        </BackToLogin>
      </VerifyEmailCard>
    </VerifyEmailContainer>
  );
};

export default VerifyEmail;

