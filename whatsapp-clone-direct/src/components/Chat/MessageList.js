import React from 'react';
import styled from 'styled-components';
import Message from './Message';

const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-image: url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be8e74ff1bd9d4c28ab19fe3d77f32.png');
  background-color: var(--chat-background);
  position: relative;
`;

const DateDivider = styled.div`
  text-align: center;
  margin: 10px 0;
  position: relative;
`;

const DateBadge = styled.span`
  background-color: #e1f3fb;
  color: var(--text-primary);
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 8px;
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
  display: inline-block;
`;

const MessageList = ({ messages, contact, messagesEndRef }) => {
  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <MessageListContainer>
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <React.Fragment key={date}>
          <DateDivider>
            <DateBadge>{formatDate(date)}</DateBadge>
          </DateDivider>
          
          {dateMessages.map((message) => (
            <Message 
              key={message.id} 
              message={message} 
              isOutgoing={message.senderId === 1}
            />
          ))}
        </React.Fragment>
      ))}
      <div ref={messagesEndRef} />
    </MessageListContainer>
  );
};

export default MessageList;

