import React, { useState } from 'react';
import styled from 'styled-components';
import { FaReply, FaPaperPlane, FaSmile } from 'react-icons/fa';

const ReplyInputContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  z-index: 15;
`;

const InputWrapper = styled.div`
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
`;

const ReplyIcon = styled.div`
  color: rgba(255, 255, 255, 0.7);
  margin-right: 8px;
`;

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const EmojiButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  cursor: pointer;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  cursor: pointer;
  
  &:disabled {
    background-color: rgba(255, 255, 255, 0.2);
    cursor: default;
  }
`;

/**
 * Component for replying to status updates
 */
const StatusReplyInput = ({ onSendReply, onClose }) => {
  const [replyText, setReplyText] = useState('');
  
  const handleSendReply = () => {
    if (replyText.trim()) {
      onSendReply(replyText);
      setReplyText('');
      if (onClose) onClose();
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && replyText.trim()) {
      handleSendReply();
    }
  };
  
  return (
    <ReplyInputContainer>
      <InputWrapper>
        <ReplyIcon>
          <FaReply />
        </ReplyIcon>
        <Input
          type="text"
          placeholder="Reply to status..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyPress={handleKeyPress}
          autoFocus
        />
        <EmojiButton type="button">
          <FaSmile />
        </EmojiButton>
      </InputWrapper>
      <SendButton 
        disabled={!replyText.trim()} 
        onClick={handleSendReply}
      >
        <FaPaperPlane />
      </SendButton>
    </ReplyInputContainer>
  );
};

export default StatusReplyInput;

