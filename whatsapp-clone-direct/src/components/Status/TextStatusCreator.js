import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaSmile, FaPalette, FaFont, FaPaperPlane } from 'react-icons/fa';
import { useStory } from '../../contexts/StoryContext';

const CreatorContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${props => props.backgroundColor || '#128C7E'};
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
  padding: 20px;
`;

const TextInput = styled.textarea`
  width: 100%;
  height: auto;
  background-color: transparent;
  border: none;
  color: ${props => props.textColor || 'white'};
  font-size: 28px;
  font-family: ${props => props.fontFamily || 'Arial, sans-serif'};
  text-align: center;
  resize: none;
  outline: none;
  padding: 20px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
`;

const ColorPalette = styled.div`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: absolute;
  bottom: 80px;
  left: 0;
  width: 100%;
  padding: 16px;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ColorOption = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.color};
  cursor: pointer;
  border: 2px solid ${props => props.isSelected ? 'white' : 'transparent'};
`;

const FontOptions = styled.div`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: absolute;
  bottom: 80px;
  left: 0;
  width: 100%;
  padding: 16px;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.5);
`;

const FontOption = styled.div`
  padding: 12px;
  color: white;
  font-family: ${props => props.fontFamily};
  cursor: pointer;
  text-align: center;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const SendButton = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${props => props.isActive ? 'white' : 'rgba(255, 255, 255, 0.3)'};
  color: ${props => props.isActive ? props.backgroundColor : 'rgba(255, 255, 255, 0.7)'};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => props.isActive ? 'pointer' : 'default'};
  pointer-events: ${props => props.isActive ? 'auto' : 'none'};
  transition: all 0.2s ease;
`;

const TextStatusCreator = ({ onClose }) => {
  const { addStory } = useStory();
  const [text, setText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#128C7E');
  const [textColor, setTextColor] = useState('white');
  const [fontFamily, setFontFamily] = useState('Arial, sans-serif');
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showFontOptions, setShowFontOptions] = useState(false);
  const textInputRef = useRef(null);
  
  const backgroundColors = [
    '#128C7E', // WhatsApp green
    '#075E54', // WhatsApp dark green
    '#25D366', // WhatsApp light green
    '#34B7F1', // WhatsApp blue
    '#ECE5DD', // WhatsApp chat background
    '#FF5722', // Orange
    '#E91E63', // Pink
    '#9C27B0', // Purple
    '#673AB7', // Deep Purple
    '#3F51B5', // Indigo
    '#2196F3', // Blue
    '#03A9F4', // Light Blue
    '#00BCD4', // Cyan
    '#009688', // Teal
    '#4CAF50', // Green
    '#8BC34A', // Light Green
    '#CDDC39', // Lime
    '#FFEB3B', // Yellow
    '#FFC107', // Amber
    '#FF9800', // Orange
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#000000', // Black
    '#FFFFFF'  // White
  ];
  
  const fontOptions = [
    'Arial, sans-serif',
    'Helvetica, sans-serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Courier New, monospace',
    'Verdana, sans-serif',
    'Tahoma, sans-serif',
    'Trebuchet MS, sans-serif',
    'Impact, sans-serif',
    'Comic Sans MS, cursive'
  ];
  
  // Focus the text input when component mounts
  useEffect(() => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  }, []);
  
  const handleTextChange = (e) => {
    setText(e.target.value);
  };
  
  const handleColorChange = (color) => {
    setBackgroundColor(color);
    // Adjust text color based on background brightness
    if (color === '#FFFFFF' || color === '#ECE5DD' || color === '#FFEB3B' || color === '#CDDC39') {
      setTextColor('#000000');
    } else {
      setTextColor('#FFFFFF');
    }
    setShowColorPalette(false);
  };
  
  const handleFontChange = (font) => {
    setFontFamily(font);
    setShowFontOptions(false);
  };
  
  const toggleColorPalette = () => {
    setShowColorPalette(!showColorPalette);
    setShowFontOptions(false);
  };
  
  const toggleFontOptions = () => {
    setShowFontOptions(!showFontOptions);
    setShowColorPalette(false);
  };
  
  const handleSend = () => {
    if (text.trim()) {
      addStory({
        type: 'text',
        content: text,
        backgroundColor,
        textColor,
        fontFamily
      });
      onClose();
    }
  };
  
  return (
    <CreatorContainer backgroundColor={backgroundColor}>
      <Header>
        <BackButton onClick={onClose}>
          <FaArrowLeft />
        </BackButton>
        <HeaderActions>
          <ActionButton onClick={toggleFontOptions}>
            <FaFont />
          </ActionButton>
          <ActionButton onClick={toggleColorPalette}>
            <FaPalette />
          </ActionButton>
          <ActionButton>
            <FaSmile />
          </ActionButton>
        </HeaderActions>
      </Header>
      
      <ContentArea>
        <TextInput 
          ref={textInputRef}
          value={text}
          onChange={handleTextChange}
          placeholder="Type a status"
          textColor={textColor}
          fontFamily={fontFamily}
        />
      </ContentArea>
      
      <Footer>
        <div></div> {/* Empty div for spacing */}
        <SendButton 
          isActive={text.trim().length > 0}
          backgroundColor={backgroundColor}
          onClick={handleSend}
        >
          <FaPaperPlane />
        </SendButton>
      </Footer>
      
      <ColorPalette isOpen={showColorPalette}>
        {backgroundColors.map(color => (
          <ColorOption 
            key={color}
            color={color}
            isSelected={backgroundColor === color}
            onClick={() => handleColorChange(color)}
          />
        ))}
      </ColorPalette>
      
      <FontOptions isOpen={showFontOptions}>
        {fontOptions.map(font => (
          <FontOption 
            key={font}
            fontFamily={font}
            onClick={() => handleFontChange(font)}
          >
            {font.split(',')[0]}
          </FontOption>
        ))}
      </FontOptions>
    </CreatorContainer>
  );
};

export default TextStatusCreator;

