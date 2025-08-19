import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { getChatByContactId } from '../../data/mockData';
import EmptyChat from './EmptyChat';
import { useChat } from '../../contexts/ChatContext';

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
  const { addMessage, chats } = useChat();

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
  
  // Update messages when chat context changes
  useEffect(() => {
    if (selectedContact && chat) {
      // Find the updated chat in the context
      const updatedChat = chats.find(c => c.id === chat.id);
      if (updatedChat) {
        setMessages(updatedChat.messages);
      }
    }
  }, [chats, selectedContact, chat]);

  const handleSendMessage = (text, attachment = null) => {
    if ((!text.trim() && !attachment) || !selectedContact) return;
    
    const newMessage = {
      senderId: 1, // Current user ID
      text,
      status: 'sent'
    };
    
    // Add attachment if provided
    if (attachment) {
      if (attachment.type === 'image') {
        newMessage.image = attachment.url;
      } else {
        newMessage.file = {
          url: attachment.url,
          name: attachment.name,
          size: attachment.size
        };
      }
    }
    
    // Add message to the chat context
    addMessage(selectedContact.id, newMessage);
    
    // Update local state for immediate UI update
    setMessages([...messages, {
      ...newMessage,
      id: messages.length + 1,
      timestamp: new Date().toISOString()
    }]);
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
