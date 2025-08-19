import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import WhatsAppLogo from '../../assets/whatsapp-logo.png';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: var(--app-background);
`;

const LoginCard = styled.div`
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

const RememberMe = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  input {
    margin-right: 8px;
  }
  
  label {
    font-size: 14px;
    color: var(--text-primary);
  }
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

const GoogleButton = styled(Button)`
  background-color: #4285f4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
  
  &:hover {
    background-color: #3367d6;
  }
  
  svg {
    margin-right: 10px;
  }
`;

const ForgotPassword = styled.div`
  text-align: center;
  margin-top: 20px;
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 14px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 30px;
  font-size: 14px;
  color: var(--text-primary);
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
    
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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loginWithGoogle, error: authError } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      
      // Store email in localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to log in with Google');
    } finally {
      setLoading(false);
    }
  };
  
  // Load remembered email if available
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);
  
  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <img src={WhatsAppLogo} alt="WhatsApp" />
          <h1>WhatsApp</h1>
        </Logo>
        
        <Title>Log in to your account</Title>
        
        {(error || authError) && (
          <ErrorMessage>
            {error || authError}
          </ErrorMessage>
        )}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <InputWrapper>
              <InputIcon>
                <FaEnvelope />
              </InputIcon>
              <Input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputWrapper>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <InputWrapper>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <PasswordToggle onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputWrapper>
          </FormGroup>
          
          <RememberMe>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </RememberMe>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
          
          <GoogleButton type="button" onClick={handleGoogleLogin} disabled={loading}>
            <FaGoogle />
            Log in with Google
          </GoogleButton>
        </Form>
        
        <ForgotPassword>
          <Link to="/forgot-password">Forgot your password?</Link>
        </ForgotPassword>
        
        <RegisterLink>
          Don't have an account? <Link to="/register">Register</Link>
        </RegisterLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;

