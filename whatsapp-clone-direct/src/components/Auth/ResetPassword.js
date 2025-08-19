import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../firebase/config';
import WhatsAppLogo from '../../assets/whatsapp-logo.png';

const ResetPasswordContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: var(--app-background);
`;

const ResetPasswordCard = styled.div`
  background-color: var(--sidebar-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 30px;
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
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const Label = styled.label`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: block;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 16px;
  color: var(--text-primary);
  background-color: var(--incoming-message);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  color: var(--icon-color);
  font-size: 18px;
`;

const PasswordToggle = styled.div`
  position: absolute;
  right: 12px;
  color: var(--icon-color);
  font-size: 18px;
  cursor: pointer;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const PasswordStrength = styled.div`
  margin-top: 8px;
  font-size: 12px;
`;

const StrengthMeter = styled.div`
  height: 5px;
  border-radius: 3px;
  margin-top: 5px;
  background-color: ${props => {
    if (props.strength === 'strong') return '#4caf50';
    if (props.strength === 'medium') return '#ff9800';
    return '#f44336';
  }};
  width: ${props => {
    if (props.strength === 'strong') return '100%';
    if (props.strength === 'medium') return '66%';
    return '33%';
  }};
`;

const StrengthText = styled.span`
  color: ${props => {
    if (props.strength === 'strong') return '#4caf50';
    if (props.strength === 'medium') return '#ff9800';
    return '#f44336';
  }};
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

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [actionCode, setActionCode] = useState('');
  const [verifying, setVerifying] = useState(true);
  
  const { error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract the action code from the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get('oobCode');
    
    if (!oobCode) {
      setError('Invalid password reset link. Please request a new one.');
      setVerifying(false);
      return;
    }
    
    setActionCode(oobCode);
    
    // Verify the action code
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
        setVerifying(false);
      })
      .catch((err) => {
        console.error('Error verifying reset code:', err);
        setError('Invalid or expired password reset link. Please request a new one.');
        setVerifying(false);
      });
  }, [location]);
  
  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) return '';
    
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    const strength = 
      (hasLowerCase ? 1 : 0) +
      (hasUpperCase ? 1 : 0) +
      (hasNumber ? 1 : 0) +
      (hasSpecialChar ? 1 : 0) +
      (isLongEnough ? 1 : 0);
    
    if (strength >= 4) return 'strong';
    if (strength >= 2) return 'medium';
    return 'weak';
  };
  
  const passwordStrength = calculatePasswordStrength(password);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordStrength === 'weak') {
      setError('Please use a stronger password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Confirm password reset
      await confirmPasswordReset(auth, actionCode, password);
      
      setSuccess('Password has been reset successfully! You can now log in with your new password.');
      
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };
  
  if (verifying) {
    return (
      <ResetPasswordContainer>
        <ResetPasswordCard>
          <Logo>
            <img src={WhatsAppLogo} alt="WhatsApp" />
            <h1>WhatsApp</h1>
          </Logo>
          
          <Title>Verifying your request</Title>
          <Subtitle>Please wait while we verify your password reset link...</Subtitle>
        </ResetPasswordCard>
      </ResetPasswordContainer>
    );
  }
  
  return (
    <ResetPasswordContainer>
      <ResetPasswordCard>
        <Logo>
          <img src={WhatsAppLogo} alt="WhatsApp" />
          <h1>WhatsApp</h1>
        </Logo>
        
        <Title>Reset your password</Title>
        {email && <Subtitle>Enter a new password for {email}</Subtitle>}
        
        {(error || authError) && (
          <ErrorMessage>
            {error || authError}
          </ErrorMessage>
        )}
        
        {success && (
          <SuccessMessage>
            {success}
          </SuccessMessage>
        )}
        
        {!error && !success && (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="password">New Password</Label>
              <InputWrapper>
                <InputIcon>
                  <FaLock />
                </InputIcon>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <PasswordToggle onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggle>
              </InputWrapper>
              
              {password && (
                <PasswordStrength>
                  <StrengthText strength={passwordStrength}>
                    {passwordStrength === 'strong' && 'Strong password'}
                    {passwordStrength === 'medium' && 'Medium password - add numbers or special characters'}
                    {passwordStrength === 'weak' && 'Weak password - use at least 8 characters with letters, numbers, and symbols'}
                  </StrengthText>
                  <StrengthMeter strength={passwordStrength} />
                </PasswordStrength>
              )}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <InputWrapper>
                <InputIcon>
                  <FaLock />
                </InputIcon>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <PasswordToggle onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggle>
              </InputWrapper>
            </FormGroup>
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Form>
        )}
        
        <BackToLogin>
          <Link to="/login">
            <FaArrowLeft />
            Back to login
          </Link>
        </BackToLogin>
      </ResetPasswordCard>
    </ResetPasswordContainer>
  );
};

export default ResetPassword;

