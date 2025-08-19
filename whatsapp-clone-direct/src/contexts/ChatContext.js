import React, { createContext, useState, useContext, useEffect } from 'react';
import { chats as initialChats, getChatByContactId } from '../data/mockData';

// Create the chat context
const ChatContext = createContext();

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

// Chat provider component
export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState(initialChats);
  const [archivedChats, setArchivedChats] = useState([]);
  const [typingStatus, setTypingStatus] = useState({});
  
  // Function to update a chat
  const updateChat = (chatId, updatedChat) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, ...updatedChat } : chat
      )
    );
  };

  // Function to add a new message to a chat
  const addMessage = (contactId, message) => {
    const chat = getChatByContactId(contactId);
    
    if (chat) {
      const updatedMessages = [...chat.messages, {
        ...message,
        id: chat.messages.length + 1,
        timestamp: new Date().toISOString()
      }];
      
      updateChat(chat.id, { 
        messages: updatedMessages,
        lastMessageTimestamp: new Date().toISOString()
      });
      
      // If this is a message sent by the current user, simulate status updates
      if (message.senderId === 1) {
        simulateMessageStatusUpdates(chat.id, updatedMessages.length);
      }
      
      return true;
    }
    
    return false;
  };

  // Function to set typing status
  const setTyping = (contactId, isTyping) => {
    setTypingStatus(prev => ({
      ...prev,
      [contactId]: isTyping
    }));
    
    // Auto clear typing status after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        setTypingStatus(prev => ({
          ...prev,
          [contactId]: false
        }));
      }, 3000);
    }
  };

  // Function to mark messages as read
  const markMessagesAsRead = (contactId) => {
    const chat = getChatByContactId(contactId);
    
    if (chat) {
      const updatedMessages = chat.messages.map(message => ({
        ...message,
        status: message.senderId !== 1 ? message.status : 'read'
      }));
      
      updateChat(chat.id, { 
        messages: updatedMessages,
        unreadCount: 0
      });
    }
  };

  // Function to delete a message
  const deleteMessage = (chatId, messageId) => {
    const chat = chats.find(c => c.id === chatId);
    
    if (chat) {
      const updatedMessages = chat.messages.filter(message => message.id !== messageId);
      updateChat(chatId, { messages: updatedMessages });
    }
  };
  
  // Function to update message status
  const updateMessageStatus = (chatId, messageId, newStatus) => {
    const chat = chats.find(c => c.id === chatId);
    
    if (chat) {
      const updatedMessages = chat.messages.map(message => 
        message.id === messageId ? { ...message, status: newStatus } : message
      );
      
      updateChat(chat.id, { messages: updatedMessages });
      return true;
    }
    
    return false;
  };
  
  // Function to simulate message status updates (sent -> delivered -> read)
  const simulateMessageStatusUpdates = (chatId, messageId) => {
    // Simulate 'delivered' status after 1 second
    setTimeout(() => {
      updateMessageStatus(chatId, messageId, 'delivered');
      
      // Simulate 'read' status after another 2-5 seconds
      setTimeout(() => {
        updateMessageStatus(chatId, messageId, 'read');
      }, Math.random() * 3000 + 2000); // Random time between 2-5 seconds
    }, 1000);
  };

  // Simulate receiving messages for demo purposes
  useEffect(() => {
    const simulateIncomingMessage = () => {
      // Randomly select a contact to send a message
      const randomChatIndex = Math.floor(Math.random() * initialChats.length);
      const randomChat = initialChats[randomChatIndex];
      const contactId = randomChat.contactId;
      
      // Set typing indicator
      setTyping(contactId, true);
      
      // After a delay, add the message
      setTimeout(() => {
        const messages = [
          "Hey, how's it going?",
          "Did you see the news today?",
          "Are we still meeting tomorrow?",
          "I just sent you an email, please check.",
          "Can you call me when you're free?",
          "Have a great day! 😊",
          "What are your plans for the weekend?",
          "Thanks for your help yesterday!"
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        addMessage(contactId, {
          senderId: contactId,
          text: randomMessage,
          status: 'delivered'
        });
        
        setTyping(contactId, false);
      }, 3000);
    };
    
    // Simulate a message every 30-60 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.5) { // 50% chance to receive a message
        simulateIncomingMessage();
      }
    }, Math.random() * 30000 + 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Function to set a message as starred/unstarred
  const toggleStarMessage = (chatId, messageId, isStarred) => {
    const chat = chats.find(c => c.id === chatId);
    
    if (chat) {
      const updatedMessages = chat.messages.map(message => 
        message.id === messageId ? { ...message, isStarred } : message
      );
      
      updateChat(chat.id, { messages: updatedMessages });
      return true;
    }
    
    return false;
  };

  // Function to forward a message to another chat
  const forwardMessage = (message, targetContactId) => {
    const newMessage = {
      ...message,
      senderId: 1, // Current user is forwarding
      timestamp: new Date().toISOString(),
      status: 'sent',
      isForwarded: true
    };
    
    return addMessage(targetContactId, newMessage);
  };
  
  // Function to archive a chat
  const archiveChat = (chatId) => {
    const chatToArchive = chats.find(chat => chat.id === chatId);
    
    if (chatToArchive) {
      // Remove from active chats
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      
      // Add to archived chats
      setArchivedChats(prevArchived => [...prevArchived, { ...chatToArchive, isArchived: true }]);
      
      return true;
    }
    
    return false;
  };
  
  // Function to unarchive a chat
  const unarchiveChat = (chatId) => {
    const chatToUnarchive = archivedChats.find(chat => chat.id === chatId);
    
    if (chatToUnarchive) {
      // Remove from archived chats
      setArchivedChats(prevArchived => prevArchived.filter(chat => chat.id !== chatId));
      
      // Add to active chats
      setChats(prevChats => [...prevChats, { ...chatToUnarchive, isArchived: false }]);
      
      return true;
    }
    
    return false;
  };

  // Context value
  const value = {
    chats,
    archivedChats,
    typingStatus,
    addMessage,
    updateChat,
    setTyping,
    markMessagesAsRead,
    deleteMessage,
    updateMessageStatus,
    toggleStarMessage,
    forwardMessage,
    archiveChat,
    unarchiveChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
