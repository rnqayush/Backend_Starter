import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { getChatByContactId } from '../../data/mockData';
import EmptyChat from './EmptyChat';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 70%;
  height: 100%;
  background-color: var(--chat-background);
  position: relative;
  
  @media (max-width: 768px) {
    flex: 100%;
    display: ${props => props.isChatOpen ? 'flex' : 'none'};
  }
`;

const Chat = ({ selectedContact, isChatOpen, setIsChatOpen }) => {
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedContact) {
      const currentChat = getChatByContactId(selectedContact.id);
      setChat(currentChat);
      setMessages(currentChat.messages);
    } else {
      setChat(null);
      setMessages([]);
    }
  }, [selectedContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text) => {
    if (!text.trim() || !selectedContact) return;
    
    const newMessage = {
      id: messages.length + 1,
      senderId: 1, // Current user ID
      text,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    
    setMessages([...messages, newMessage]);
  };

  if (!selectedContact) {
    return <EmptyChat />;
  }

  return (
    <ChatContainer isChatOpen={isChatOpen}>
      <ChatHeader 
        contact={selectedContact} 
        setIsChatOpen={setIsChatOpen}
      />
      <MessageList 
        messages={messages} 
        contact={selectedContact}
        messagesEndRef={messagesEndRef}
      />
      <ChatInput onSendMessage={handleSendMessage} />
    </ChatContainer>
  );
};

export default Chat;

