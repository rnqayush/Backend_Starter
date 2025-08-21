import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaSmile, 
  FaPaperclip, 
  FaMicrophone, 
  FaPaperPlane,
  FaTimes,
  FaImage,
  FaFile,
  FaCamera,
  FaMapMarkerAlt,
  FaUser,
  FaGift,
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaCode
} from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { useChat } from '../../contexts/ChatContext';
import VoiceRecorder from './VoiceRecorder';
import CameraInterface from './CameraInterface';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--sidebar-header);
  position: relative;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
`;

const FormattingToolbar = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 16px;
  border-top: 1px solid var(--border-color);
  background-color: var(--sidebar-header);
`;

const IconWrapper = styled.div`
  color: var(--icon-color);
  font-size: 20px;
  margin: 0 10px;
  cursor: pointer;
  
  &:hover {
    color: var(--secondary-color);
  }
`;

const FormatButton = styled.div`
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--icon-color)'};
  font-size: 16px;
  margin: 0 8px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const InputField = styled.div`
  flex: 1;
  background-color: var(--incoming-message);
  border-radius: 8px;
  padding: 9px 12px;
  margin: 0 10px;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: var(--text-primary);
  background-color: transparent;
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const SendButton = styled.div`
  color: var(--icon-color);
  font-size: 20px;
  cursor: pointer;
  margin-left: 10px;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const EmojiPickerContainer = styled.div`
  position: absolute;
  bottom: 70px;
  left: 10px;
  z-index: 100;
`;

const AttachmentMenu = styled.div`
  position: absolute;
  bottom: 70px;
  left: 60px;
  background-color: var(--dropdown-background);
  border-radius: 8px;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26), 0 2px 10px 0 rgba(0, 0, 0, 0.16);
  padding: 8px 0;
  display: ${props => props.isOpen ? 'block' : 'none'};
  z-index: 100;
`;

const AttachmentOption = styled.div`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    background-color: var(--dropdown-hover);
  }
  
  svg {
    margin-right: 10px;
  }
`;

const FilePreviewContainer = styled.div`
  position: absolute;
  bottom: 70px;
  left: 10px;
  right: 10px;
  background-color: var(--sidebar-header);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
`;

const FilePreviewImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
`;

const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const FileName = styled.div`
  font-size: 14px;
  color: var(--text-primary);
`;

const FileSize = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const CloseButton = styled.div`
  color: var(--icon-color);
  cursor: pointer;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ChatInput = ({ onSendMessage, contactId }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const attachMenuRef = useRef(null);
  const inputRef = useRef(null);
  const { setTyping } = useChat();
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) {
        setShowAttachMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Add keyboard shortcuts for formatting
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only process if input is focused
      if (document.activeElement !== inputRef.current) return;
      
      // Bold: Ctrl+B
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        applyBold();
      }
      
      // Italic: Ctrl+I
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        applyItalic();
      }
      
      // Strikethrough: Ctrl+S (note: this might conflict with save in some browsers)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        applyStrikethrough();
      }
      
      // Code: Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        applyCode();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [message, selectionStart, selectionEnd]);
  
  const handleSend = () => {
    if ((message.trim() || selectedFile) && onSendMessage) {
      if (selectedFile) {
        // In a real app, we would upload the file and get a URL
        // For demo purposes, we'll use a data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const messageText = message.trim() ? message : selectedFile.name;
          onSendMessage(messageText, {
            type: selectedFile.type.startsWith('image/') ? 'image' : 'file',
            url: e.target.result,
            name: selectedFile.name,
            size: selectedFile.size
          });
          setMessage('');
          setSelectedFile(null);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        onSendMessage(message);
        setMessage('');
      }
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
  };
  
  const handleAttachClick = () => {
    setShowAttachMenu(!showAttachMenu);
  };
  
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setShowAttachMenu(false);
    }
  };
  
  const handleImageClick = () => {
    fileInputRef.current.accept = 'image/*';
    fileInputRef.current.click();
  };
  
  const handleDocumentClick = () => {
    fileInputRef.current.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt';
    fileInputRef.current.click();
  };
  
  const handleCameraClick = () => {
    setShowCamera(true);
    setShowAttachMenu(false);
  };
  
  const handleCameraCapture = (media) => {
    if (media.type === 'image') {
      const file = dataURLtoFile(media.data, media.name);
      setSelectedFile(file);
    } else if (media.type === 'video') {
      // For video, we'd need to handle the blob URL differently
      // This is a simplified version
      fetch(media.data)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], media.name, { type: 'video/webm' });
          setSelectedFile(file);
        });
    }
  };
  
  // Helper function to convert data URL to File object
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };
  
  const handleClearFile = () => {
    setSelectedFile(null);
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Simulate typing indicator
    if (contactId) {
      setTyping(contactId, true);
    }
  };
  
  const handleInputSelect = (e) => {
    setSelectionStart(e.target.selectionStart);
    setSelectionEnd(e.target.selectionEnd);
  };
  
  const applyFormatting = (formatChar) => {
    if (!inputRef.current) return;
    
    const start = selectionStart;
    const end = selectionEnd;
    
    if (start === end) {
      // No text selected, just insert the formatting characters
      const newMessage = 
        message.substring(0, start) + 
        formatChar + formatChar + 
        message.substring(end);
      
      setMessage(newMessage);
      
      // Set cursor position between the formatting characters
      setTimeout(() => {
        inputRef.current.selectionStart = start + 1;
        inputRef.current.selectionEnd = start + 1;
        inputRef.current.focus();
      }, 0);
    } else {
      // Text selected, wrap it with formatting characters
      const selectedText = message.substring(start, end);
      const newMessage = 
        message.substring(0, start) + 
        formatChar + selectedText + formatChar + 
        message.substring(end);
      
      setMessage(newMessage);
      
      // Set cursor position after the formatted text
      setTimeout(() => {
        inputRef.current.selectionStart = end + 2;
        inputRef.current.selectionEnd = end + 2;
        inputRef.current.focus();
      }, 0);
    }
  };
  
  const applyBold = () => applyFormatting('*');
  const applyItalic = () => applyFormatting('_');
  const applyStrikethrough = () => applyFormatting('~');
  
  const applyCode = () => {
    if (!inputRef.current) return;
    
    const start = selectionStart;
    const end = selectionEnd;
    
    if (start === end) {
      // No text selected
      const newMessage = 
        message.substring(0, start) + 
        '```' + '```' + 
        message.substring(end);
      
      setMessage(newMessage);
      
      // Set cursor position between the code markers
      setTimeout(() => {
        inputRef.current.selectionStart = start + 3;
        inputRef.current.selectionEnd = start + 3;
        inputRef.current.focus();
      }, 0);
    } else {
      // Text selected
      const selectedText = message.substring(start, end);
      const newMessage = 
        message.substring(0, start) + 
        '```' + selectedText + '```' + 
        message.substring(end);
      
      setMessage(newMessage);
      
      // Set cursor position after the formatted text
      setTimeout(() => {
        inputRef.current.selectionStart = end + 6;
        inputRef.current.selectionEnd = end + 6;
        inputRef.current.focus();
      }, 0);
    }
  };
  
  const handleStartRecording = () => {
    setIsRecording(true);
  };
  
  const handleCancelRecording = () => {
    setIsRecording(false);
  };
  
  const handleSendAudio = (audioData) => {
    if (onSendMessage) {
      onSendMessage('', {
        type: 'voice',
        audio: audioData.url,
        duration: audioData.duration,
        name: 'Voice message'
      });
      setIsRecording(false);
    }
  };
  
  return (
    <>
      {isRecording ? (
        <VoiceRecorder 
          onSend={handleSendAudio}
          onCancel={handleCancelRecording}
        />
      ) : showCamera ? (
        <CameraInterface 
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      ) : (
        <>
          <InputContainer>
            <InputRow>
              <IconWrapper 
                title="Emoji" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <FaSmile />
              </IconWrapper>
              
              <IconWrapper 
                title="Attach" 
                onClick={handleAttachClick}
              >
                <FaPaperclip />
              </IconWrapper>
              
              <InputField>
                <Input 
                  ref={inputRef}
                  placeholder="Type a message"
                  value={message}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onSelect={handleInputSelect}
                />
              </InputField>
              
              {message.trim() || selectedFile ? (
                <SendButton onClick={handleSend} title="Send">
                  <FaPaperPlane />
                </SendButton>
              ) : (
                <>
                  <IconWrapper 
                    title="Formatting" 
                    onClick={() => setShowFormatting(!showFormatting)}
                  >
                    <FaBold />
                  </IconWrapper>
                  <IconWrapper 
                    title="Voice message" 
                    onClick={handleStartRecording}
                  >
                    <FaMicrophone />
                  </IconWrapper>
                </>
              )}
            </InputRow>
            
            {showFormatting && (
              <FormattingToolbar>
                <FormatButton 
                  title="Bold (Ctrl+B)" 
                  onClick={applyBold}
                >
                  <FaBold />
                </FormatButton>
                <FormatButton 
                  title="Italic (Ctrl+I)" 
                  onClick={applyItalic}
                >
                  <FaItalic />
                </FormatButton>
                <FormatButton 
                  title="Strikethrough (Ctrl+S)" 
                  onClick={applyStrikethrough}
                >
                  <FaStrikethrough />
                </FormatButton>
                <FormatButton 
                  title="Code (Ctrl+Shift+C)" 
                  onClick={applyCode}
                >
                  <FaCode />
                </FormatButton>
              </FormattingToolbar>
            )}
            
            {showEmojiPicker && (
              <EmojiPickerContainer ref={emojiPickerRef}>
                <EmojiPicker 
                  onEmojiClick={handleEmojiClick}
                  searchDisabled={false}
                  skinTonesDisabled={true}
                  width={300}
                  height={400}
                  previewConfig={{ showPreview: false }}
                />
              </EmojiPickerContainer>
            )}
            
            <AttachmentMenu isOpen={showAttachMenu} ref={attachMenuRef}>
              <AttachmentOption onClick={handleImageClick}>
                <FaImage />
                Photos & Videos
              </AttachmentOption>
              <AttachmentOption onClick={handleDocumentClick}>
                <FaFile />
                Documents
              </AttachmentOption>
              <AttachmentOption onClick={handleCameraClick}>
                <FaCamera />
                Camera
              </AttachmentOption>
              <AttachmentOption onClick={() => {
                console.log('Location sharing clicked');
                setShowAttachMenu(false);
              }}>
                <FaMapMarkerAlt />
                Location
              </AttachmentOption>
              <AttachmentOption onClick={() => {
                console.log('Contact sharing clicked');
                setShowAttachMenu(false);
              }}>
                <FaUser />
                Contact
              </AttachmentOption>
              <AttachmentOption onClick={() => {
                console.log('GIF clicked');
                setShowAttachMenu(false);
              }}>
                <FaGift />
                GIF
              </AttachmentOption>
            </AttachmentMenu>
            
            <HiddenFileInput 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect}
            />
          </InputContainer>
          
          {selectedFile && (
            <FilePreviewContainer>
              <FilePreview>
                {selectedFile.type.startsWith('image/') ? (
                  <FilePreviewImage 
                    src={URL.createObjectURL(selectedFile)} 
                    alt="Selected file"
                  />
                ) : (
                  <FaFile size={30} style={{ marginRight: '10px' }} />
                )}
                <FileInfo>
                  <FileName>{selectedFile.name}</FileName>
                  <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
                </FileInfo>
              </FilePreview>
              <CloseButton onClick={handleClearFile}>
                <FaTimes />
              </CloseButton>
            </FilePreviewContainer>
          )}
        </>
      )}
    </>
  );
};

export default ChatInput;
