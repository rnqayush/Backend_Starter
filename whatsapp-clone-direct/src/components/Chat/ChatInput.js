import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSmile, FaPaperclip, FaMicrophone, FaPaperPlane } from 'react-icons/fa';

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
  background-color: white;
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

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  
  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  return (
    <InputContainer>
      <IconWrapper title="Emoji">
        <FaSmile />
      </IconWrapper>
      <IconWrapper title="Attach">
        <FaPaperclip />
      </IconWrapper>
      
      <InputField>
        <Input 
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </InputField>
      
      {message.trim() ? (
        <SendButton onClick={handleSend} title="Send">
          <FaPaperPlane />
        </SendButton>
      ) : (
        <IconWrapper title="Voice message">
          <FaMicrophone />
        </IconWrapper>
      )}
    </InputContainer>
  );
};

export default ChatInput;

