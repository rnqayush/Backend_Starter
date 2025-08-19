import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaTimes, FaFont, FaPalette, FaImage, FaPaperPlane } from 'react-icons/fa';
import { useStory } from '../../contexts/StoryContext';

const Container = styled.div`
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

const Canvas = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 80vh;
  max-height: 700px;
  background-color: ${props => props.backgroundColor || '#075E54'};
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  color: white;
`;

const BackButton = styled.div`
  font-size: 20px;
  cursor: pointer;
`;

const CloseButton = styled.div`
  font-size: 20px;
  cursor: pointer;
`;

const StatusPreview = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
`;

const StatusText = styled.textarea`
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  color: ${props => props.color || 'white'};
  font-size: ${props => props.fontSize || '24px'};
  font-family: ${props => props.fontFamily || 'Arial, sans-serif'};
  text-align: center;
  resize: none;
  padding: 20px;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const StatusImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const ToolBar = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.3);
`;

const Tool = styled.div`
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ColorPicker = styled.div`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: ${props => props.show ? 'flex' : 'none'};
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
  padding: 10px;
  gap: 10px;
`;

const ColorOption = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.color};
  cursor: pointer;
  border: 2px solid ${props => props.selected ? 'white' : 'transparent'};
`;

const FontPicker = styled.div`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: ${props => props.show ? 'flex' : 'none'};
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  padding: 10px;
  gap: 10px;
  width: 200px;
`;

const FontOption = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  font-family: ${props => props.fontFamily};
  color: white;
  text-align: center;
  border-radius: 5px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  ${props => props.selected && `
    background-color: rgba(255, 255, 255, 0.2);
  `}
`;

const SendButton = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background-color: #054c44;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const StatusCreator = ({ onClose }) => {
  const { addStory, setShowStoryCreator } = useStory();
  
  const [text, setText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#075E54');
  const [textColor, setTextColor] = useState('white');
  const [fontFamily, setFontFamily] = useState('Arial, sans-serif');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [image, setImage] = useState(null);
  
  const fileInputRef = useRef(null);
  
  const backgroundColors = [
    '#075E54', // WhatsApp green
    '#128C7E',
    '#25D366',
    '#34B7F1', // WhatsApp blue
    '#01579B',
    '#4A148C', // Purple
    '#880E4F', // Pink
    '#B71C1C', // Red
    '#FF6F00', // Orange
    '#212121', // Black
  ];
  
  const fontFamilies = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
  ];
  
  const handleTextChange = (e) => {
    setText(e.target.value);
  };
  
  const handleColorClick = (color) => {
    setBackgroundColor(color);
    setShowColorPicker(false);
  };
  
  const handleFontClick = (font) => {
    setFontFamily(font);
    setShowFontPicker(false);
  };
  
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  
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
  
  const handleSend = () => {
    if (image) {
      // Create image story
      addStory({
        type: 'image',
        content: image,
      });
    } else if (text.trim()) {
      // Create text story
      addStory({
        type: 'text',
        content: text,
        backgroundColor,
        textColor,
        fontFamily,
      });
    }
    
    // Close the creator
    setShowStoryCreator(false);
  };
  
  return (
    <Container>
      <Canvas backgroundColor={backgroundColor}>
        <Header>
          <BackButton onClick={onClose}>
            <FaArrowLeft />
          </BackButton>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>
        
        <StatusPreview>
          {image ? (
            <StatusImage src={image} alt="Status preview" />
          ) : (
            <StatusText 
              placeholder="Type a status..."
              value={text}
              onChange={handleTextChange}
              color={textColor}
              fontFamily={fontFamily}
              autoFocus
            />
          )}
          
          <ColorPicker show={showColorPicker}>
            {backgroundColors.map(color => (
              <ColorOption 
                key={color} 
                color={color} 
                selected={backgroundColor === color}
                onClick={() => handleColorClick(color)}
              />
            ))}
          </ColorPicker>
          
          <FontPicker show={showFontPicker}>
            {fontFamilies.map(font => (
              <FontOption 
                key={font.value} 
                fontFamily={font.value}
                selected={fontFamily === font.value}
                onClick={() => handleFontClick(font.value)}
              >
                {font.name}
              </FontOption>
            ))}
          </FontPicker>
        </StatusPreview>
        
        <ToolBar>
          <Tool title="Text color" onClick={() => setShowColorPicker(!showColorPicker)}>
            <FaPalette />
          </Tool>
          <Tool title="Font" onClick={() => setShowFontPicker(!showFontPicker)}>
            <FaFont />
          </Tool>
          <Tool title="Add image" onClick={handleImageClick}>
            <FaImage />
            <FileInput 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
            />
          </Tool>
        </ToolBar>
        
        <SendButton onClick={handleSend} title="Send">
          <FaPaperPlane />
        </SendButton>
      </Canvas>
    </Container>
  );
};

export default StatusCreator;

