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
  FaCamera
} from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { useChat } from '../../contexts/ChatContext';

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--sidebar-header);
  position: relative;
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
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const attachMenuRef = useRef(null);
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
  
  const handleSend = () => {
    if ((message.trim() || selectedFile) && onSendMessage) {
      if (selectedFile) {
        // In a real app, we would upload the file and get a URL
        // For demo purposes, we'll use a data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          onSendMessage(message, {
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
    fileInputRef.current.accept = 'image/*';
    fileInputRef.current.capture = 'camera';
    fileInputRef.current.click();
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
  
  return (
    <>
      <InputContainer>
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
            placeholder="Type a message"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
        </InputField>
        
        {message.trim() || selectedFile ? (
          <SendButton onClick={handleSend} title="Send">
            <FaPaperPlane />
          </SendButton>
        ) : (
          <IconWrapper title="Voice message">
            <FaMicrophone />
          </IconWrapper>
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
  );
};

export default ChatInput;

