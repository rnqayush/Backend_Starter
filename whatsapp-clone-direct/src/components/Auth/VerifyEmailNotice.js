import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase/config';
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
  max-width: 500px;
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

const WarningIcon = styled.div`
  font-size: 50px;
  color: #ff9800;
  margin: 20px 0;
`;

const Message = styled.p`
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 20px;
  line-height: 1.5;
`;

const EmailHighlight = styled.div`
  background-color: var(--search-background);
  padding: 10px;
  border-radius: 4px;
  margin: 15px 0;
  font-weight: 500;
  color: var(--text-primary);
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 20px;
  
  &:hover {
    background-color: var(--secondary-color);
  }
  
  &:disabled {
    background-color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

const LogoutLink = styled.div`
  margin-top: 30px;
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 16px;
    
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
  margin-top: 20px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 10px;
  border-radius: 4px;
  margin-top: 20px;
  font-size: 14px;
`;

const VerifyEmailNotice = () => {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await sendEmailVerification(auth.currentUser);
      
      setSuccess('Verification email sent! Please check your inbox and spam folder.');
    } catch (err) {
      console.error('Error sending verification email:', err);
      setError(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to log out');
    }
  };
  
  return (
    <VerifyEmailContainer>
      <VerifyEmailCard>
        <Logo>
          <img src={WhatsAppLogo} alt="WhatsApp" />
          <h1>WhatsApp</h1>
        </Logo>
        
        <WarningIcon>
          <FaExclamationTriangle />
        </WarningIcon>
        
        <Title>Email Verification Required</Title>
        
        <Message>
          We've sent a verification email to:
          <EmailHighlight>
            <FaEnvelope style={{ marginRight: '10px' }} />
            {currentUser?.email}
          </EmailHighlight>
          Please check your inbox and click the verification link to activate your account.
          <br /><br />
          If you don't see the email, check your spam folder or click the button below to resend the verification email.
        </Message>
        
        <Button onClick={handleResendVerification} disabled={loading}>
          {loading ? 'Sending...' : 'Resend Verification Email'}
        </Button>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <LogoutLink>
          <Link to="/login" onClick={handleLogout}>
            Log out and use a different account
          </Link>
        </LogoutLink>
      </VerifyEmailCard>
    </VerifyEmailContainer>
  );
};

export default VerifyEmailNotice;

