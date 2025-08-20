import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaSmile, FaImage, FaCamera, FaPaperPlane, FaTrash } from 'react-icons/fa';
import { useStory } from '../../contexts/StoryContext';

const CreatorContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  color: white;
  z-index: 10;
`;

const BackButton = styled.div`
  cursor: pointer;
  font-size: 18px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButton = styled.div`
  margin-left: 24px;
  cursor: pointer;
  font-size: 18px;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const CameraPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  
  svg {
    font-size: 48px;
    margin-bottom: 16px;
  }
`;

const CaptionInput = styled.input`
  width: 100%;
  background-color: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 16px;
  padding: 12px 16px;
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #000;
`;

const FileInput = styled.input`
  display: none;
`;

const SendButton = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${props => props.isActive ? '#128C7E' : 'rgba(255, 255, 255, 0.3)'};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => props.isActive ? 'pointer' : 'default'};
  pointer-events: ${props => props.isActive ? 'auto' : 'none'};
  transition: all 0.2s ease;
`;

const ImageControls = styled.div`
  display: flex;
  gap: 16px;
`;

const ImageStatusCreator = ({ onClose }) => {
  const { addStory } = useStory();
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef(null);
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };
  
  const handleOpenGallery = () => {
    fileInputRef.current.click();
  };
  
  const handleRemoveImage = () => {
    setImage(null);
    setCaption('');
  };
  
  const handleSend = () => {
    if (image) {
      addStory({
        type: 'image',
        content: image,
        caption: caption.trim() || null
      });
      onClose();
    }
  };
  
  // In a real app, this would use the device camera
  const handleOpenCamera = () => {
    // For demo purposes, we'll just open the file picker
    fileInputRef.current.click();
  };
  
  return (
    <CreatorContainer>
      <Header>
        <BackButton onClick={onClose}>
          <FaArrowLeft />
        </BackButton>
        <HeaderActions>
          {image && (
            <ActionButton onClick={handleRemoveImage}>
              <FaTrash />
            </ActionButton>
          )}
        </HeaderActions>
      </Header>
      
      <ContentArea>
        {image ? (
          <ImagePreview src={image} alt="Status preview" />
        ) : (
          <CameraPlaceholder>
            <FaCamera />
            <p>Tap to take a photo</p>
          </CameraPlaceholder>
        )}
      </ContentArea>
      
      {image && (
        <CaptionInput 
          value={caption}
          onChange={handleCaptionChange}
          placeholder="Add a caption..."
        />
      )}
      
      <Footer>
        <ImageControls>
          <ActionButton onClick={handleOpenGallery}>
            <FaImage />
          </ActionButton>
          <ActionButton onClick={handleOpenCamera}>
            <FaCamera />
          </ActionButton>
        </ImageControls>
        
        <FileInput 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageChange}
          accept="image/*"
        />
        
        <SendButton 
          isActive={image !== null}
          onClick={handleSend}
        >
          <FaPaperPlane />
        </SendButton>
      </Footer>
    </CreatorContainer>
  );
};

export default ImageStatusCreator;

