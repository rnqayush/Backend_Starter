import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaLock, FaCamera, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const ProfileContainer = styled.div`
  background-color: var(--sidebar-background);
  border-radius: 8px;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26), 0 2px 10px 0 rgba(0, 0, 0, 0.16);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
`;

const Title = styled.h2`
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 30px;
  text-align: center;
`;

const ProfileSection = styled.div`
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 20px;
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  margin-right: 20px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
  
  ${Avatar}:hover & {
    opacity: 1;
  }
`;

const CameraIcon = styled.div`
  color: white;
  font-size: 24px;
`;

const AvatarInfo = styled.div`
  flex: 1;
`;

const AvatarText = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 10px;
`;

const UploadButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--secondary-color);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
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
  
  &:disabled {
    background-color: var(--search-background);
    cursor: not-allowed;
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

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const Profile = () => {
  const { currentUser, updateUserProfile, updateUserEmail, updateUserPassword, error: authError } = useAuth();
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [status, setStatus] = useState(currentUser?.status || 'Available');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  
  const [errorProfile, setErrorProfile] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  
  const [successProfile, setSuccessProfile] = useState('');
  const [successEmail, setSuccessEmail] = useState('');
  const [successPassword, setSuccessPassword] = useState('');
  
  const fileInputRef = useRef(null);
  
  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };
  
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorProfile('Photo size should not exceed 5MB');
        return;
      }
      
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setErrorProfile('Name cannot be empty');
      return;
    }
    
    try {
      setErrorProfile('');
      setLoadingProfile(true);
      
      await updateUserProfile({
        displayName,
        photoFile,
        status
      });
      
      setSuccessProfile('Profile updated successfully!');
      setPhotoFile(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessProfile('');
      }, 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setErrorProfile(err.message || 'Failed to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrorEmail('Email cannot be empty');
      return;
    }
    
    if (!currentPassword) {
      setErrorEmail('Current password is required to change email');
      return;
    }
    
    try {
      setErrorEmail('');
      setLoadingEmail(true);
      
      await updateUserEmail(email, currentPassword);
      
      setSuccessEmail('Email updated successfully! Please verify your new email address.');
      setCurrentPassword('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessEmail('');
      }, 3000);
    } catch (err) {
      console.error('Email update error:', err);
      setErrorEmail(err.message || 'Failed to update email');
    } finally {
      setLoadingEmail(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPassword) {
      setErrorPassword('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setErrorPassword('New password is required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrorPassword('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setErrorPassword('Password should be at least 6 characters');
      return;
    }
    
    try {
      setErrorPassword('');
      setLoadingPassword(true);
      
      await updateUserPassword(currentPassword, newPassword);
      
      setSuccessPassword('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessPassword('');
      }, 3000);
    } catch (err) {
      console.error('Password update error:', err);
      setErrorPassword(err.message || 'Failed to update password');
    } finally {
      setLoadingPassword(false);
    }
  };
  
  return (
    <ProfileContainer>
      <Title>Profile Settings</Title>
      
      <ProfileSection>
        <SectionTitle>Profile Information</SectionTitle>
        
        {errorProfile && <ErrorMessage>{errorProfile}</ErrorMessage>}
        {successProfile && <SuccessMessage>{successProfile}</SuccessMessage>}
        
        <Form onSubmit={handleProfileSubmit}>
          <AvatarSection>
            <Avatar onClick={handlePhotoClick}>
              <img 
                src={photoPreview || currentUser?.photoURL || 'https://via.placeholder.com/100'} 
                alt={currentUser?.displayName || 'User'} 
              />
              <AvatarOverlay>
                <CameraIcon>
                  <FaCamera />
                </CameraIcon>
              </AvatarOverlay>
            </Avatar>
            
            <AvatarInfo>
              <AvatarText>Upload a new profile photo</AvatarText>
              <UploadButton type="button" onClick={handlePhotoClick}>
                Choose Photo
              </UploadButton>
            </AvatarInfo>
            
            <HiddenFileInput 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange}
              accept="image/*"
            />
          </AvatarSection>
          
          <FormGroup>
            <Label htmlFor="displayName">Full Name</Label>
            <InputWrapper>
              <InputIcon>
                <FaUser />
              </InputIcon>
              <Input
                type="text"
                id="displayName"
                placeholder="Enter your full name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </InputWrapper>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="status">Status</Label>
            <InputWrapper>
              <Input
                type="text"
                id="status"
                placeholder="Enter your status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </InputWrapper>
          </FormGroup>
          
          <Button type="submit" disabled={loadingProfile}>
            {loadingProfile ? 'Updating...' : 'Update Profile'}
          </Button>
        </Form>
      </ProfileSection>
      
      <ProfileSection>
        <SectionTitle>Email Address</SectionTitle>
        
        {errorEmail && <ErrorMessage>{errorEmail}</ErrorMessage>}
        {successEmail && <SuccessMessage>{successEmail}</SuccessMessage>}
        
        <Form onSubmit={handleEmailSubmit}>
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
              />
            </InputWrapper>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="currentPasswordEmail">Current Password</Label>
            <InputWrapper>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                id="currentPasswordEmail"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <PasswordToggle onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputWrapper>
          </FormGroup>
          
          <Button type="submit" disabled={loadingEmail}>
            {loadingEmail ? 'Updating...' : 'Update Email'}
          </Button>
        </Form>
      </ProfileSection>
      
      <ProfileSection>
        <SectionTitle>Change Password</SectionTitle>
        
        {errorPassword && <ErrorMessage>{errorPassword}</ErrorMessage>}
        {successPassword && <SuccessMessage>{successPassword}</SuccessMessage>}
        
        <Form onSubmit={handlePasswordSubmit}>
          <FormGroup>
            <Label htmlFor="currentPassword">Current Password</Label>
            <InputWrapper>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                id="currentPassword"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <PasswordToggle onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputWrapper>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="newPassword">New Password</Label>
            <InputWrapper>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <PasswordToggle onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputWrapper>
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
              />
              <PasswordToggle onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputWrapper>
          </FormGroup>
          
          <Button type="submit" disabled={loadingPassword}>
            {loadingPassword ? 'Updating...' : 'Change Password'}
          </Button>
        </Form>
      </ProfileSection>
    </ProfileContainer>
  );
};

export default Profile;

