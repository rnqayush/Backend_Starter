import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaTimes, FaImage, FaFont, FaPalette, FaCheck } from 'react-icons/fa';
import { useStory } from '../../contexts/StoryContext';

const CreatorContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const CreatorContent = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 80vh;
  max-height: 700px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 10px;
  background-color: ${props => props.backgroundColor || '#075E54'};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.3);
`;

const Title = styled.div`
  color: #fff;
  font-size: 18px;
  font-weight: 500;
`;

const CloseButton = styled.div`
  color: #fff;
  font-size: 20px;
  cursor: pointer;
`;

const PreviewArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
`;

const TextInput = styled.textarea`
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  color: ${props => props.fontColor || '#fff'};
  font-size: 24px;
  text-align: center;
  resize: none;
  outline: none;
  padding: 20px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const CaptionInput = styled.input`
  width: 100%;
  padding: 10px 15px;
  background-color: rgba(0, 0, 0, 0.3);
  border: none;
  color: #fff;
  font-size: 14px;
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const ToolsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.3);
`;

const Tool = styled.div`
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ColorPicker = styled.div`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: ${props => props.show ? 'flex' : 'none'};
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 10px;
  gap: 10px;
`;

const ColorOption = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.color};
  cursor: pointer;
  border: 2px solid ${props => props.selected ? '#fff' : 'transparent'};
`;

const SubmitButton = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background-color: #128C7E;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const backgroundColors = [
  '#075E54', // WhatsApp green
  '#25D366', // WhatsApp light green
  '#128C7E', // WhatsApp teal
  '#34B7F1', // WhatsApp blue
  '#ECE5DD', // WhatsApp light background
  '#FF5722', // Orange
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#3F51B5', // Indigo
  '#000000', // Black
];

const fontColors = [
  '#FFFFFF', // White
  '#000000', // Black
  '#FFEB3B', // Yellow
  '#FF5722', // Orange
  '#E91E63', // Pink
];

const StoryCreator = () => {
  const { setShowStoryCreator, addStory } = useStory();
  const [storyType, setStoryType] = useState('text'); // 'text' or 'image'
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#075E54');
  const [fontColor, setFontColor] = useState('#FFFFFF');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerType, setColorPickerType] = useState('background'); // 'background' or 'font'
  const fileInputRef = useRef(null);
  
  const handleClose = () => {
    setShowStoryCreator(false);
  };
  
  const handleTextChange = (e) => {
    setText(e.target.value);
  };
  
  const handleCaptionChange = (e) => {
    setCaption(e.target.value);
  };
  
  const handleImageSelect = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setImage(event.target.result);
        setStoryType('image');
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const handleTextMode = () => {
    setStoryType('text');
  };
  
  const handleColorPickerToggle = (type) => {
    setColorPickerType(type);
    setShowColorPicker(!showColorPicker || colorPickerType !== type);
  };
  
  const handleColorSelect = (color) => {
    if (colorPickerType === 'background') {
      setBackgroundColor(color);
    } else {
      setFontColor(color);
    }
    setShowColorPicker(false);
  };
  
  const handleSubmit = () => {
    if (storyType === 'text' && text.trim()) {
      addStory({
        type: 'text',
        text,
        backgroundColor,
        fontColor
      });
      setShowStoryCreator(false);
    } else if (storyType === 'image' && image) {
      addStory({
        type: 'image',
        url: image,
        caption: caption.trim() || undefined
      });
      setShowStoryCreator(false);
    }
  };
  
  return (
    <CreatorContainer>
      <CreatorContent backgroundColor={storyType === 'text' ? backgroundColor : '#000'}>
        <Header>
          <Title>Create Status</Title>
          <CloseButton onClick={handleClose}>
            <FaTimes />
          </CloseButton>
        </Header>
        
        <PreviewArea>
          {storyType === 'text' ? (
            <TextInput 
              value={text}
              onChange={handleTextChange}
              placeholder="Type a status..."
              fontColor={fontColor}
            />
          ) : (
            <PreviewImage src={image} alt="Preview" />
          )}
          
          {/* Color picker */}
          <ColorPicker show={showColorPicker}>
            {(colorPickerType === 'background' ? backgroundColors : fontColors).map(color => (
              <ColorOption 
                key={color} 
                color={color} 
                selected={colorPickerType === 'background' ? backgroundColor === color : fontColor === color}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </ColorPicker>
        </PreviewArea>
        
        {storyType === 'image' && (
          <CaptionInput 
            value={caption}
            onChange={handleCaptionChange}
            placeholder="Add a caption..."
          />
        )}
        
        <ToolsContainer>
          <Tool onClick={handleImageSelect} active={storyType === 'image'}>
            <FaImage />
          </Tool>
          <Tool onClick={handleTextMode} active={storyType === 'text'}>
            <FaFont />
          </Tool>
          {storyType === 'text' && (
            <>
              <Tool onClick={() => handleColorPickerToggle('background')}>
                <FaPalette />
              </Tool>
              <Tool onClick={() => handleColorPickerToggle('font')}>
                <FaFont />
              </Tool>
            </>
          )}
        </ToolsContainer>
        
        <SubmitButton onClick={handleSubmit}>
          <FaCheck />
        </SubmitButton>
      </CreatorContent>
      
      <HiddenFileInput 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept="image/*"
      />
    </CreatorContainer>
  );
};

export default StoryCreator;

