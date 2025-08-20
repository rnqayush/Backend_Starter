import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaPhone, 
  FaVideo, 
  FaArrowLeft, 
  FaSearch, 
  FaInfoCircle,
  FaPhoneSlash,
  FaPhoneAlt,
  FaPlus
} from 'react-icons/fa';
import { contacts } from '../../data/mockData';

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--background);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--primary-color);
  color: white;
  height: 60px;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  
  h1 {
    font-size: 19px;
    font-weight: 500;
    margin-left: 24px;
  }
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
`;

const SearchContainer = styled.div`
  padding: 8px 12px;
  background-color: var(--background);
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--search-input-background);
  border-radius: 8px;
  padding: 8px 12px;
  
  svg {
    color: var(--text-secondary);
    margin-right: 12px;
  }
  
  input {
    flex: 1;
    border: none;
    outline: none;
    background-color: transparent;
    color: var(--text-primary);
    
    &::placeholder {
      color: var(--text-secondary);
    }
  }
`;

const CallsList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const CallItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 16px;
  object-fit: cover;
`;

const CallInfo = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const CallDetails = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.color || 'var(--text-secondary)'};
  font-size: 13px;
  
  svg {
    margin-right: 4px;
    font-size: 10px;
    transform: ${props => props.incoming ? 'rotate(90deg)' : 'rotate(-90deg)'};
  }
`;

const CallTime = styled.div`
  color: var(--text-secondary);
  font-size: 13px;
  min-width: 80px;
  text-align: right;
`;

const CallButton = styled.div`
  margin-left: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    background-color: var(--primary-color-dark);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
  text-align: center;
  color: var(--text-secondary);
`;

const EmptyStateIcon = styled.div`
  font-size: 80px;
  color: var(--text-secondary);
  opacity: 0.5;
  margin-bottom: 16px;
`;

const EmptyStateTitle = styled.div`
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const EmptyStateText = styled.div`
  font-size: 14px;
  max-width: 300px;
  line-height: 1.5;
`;

const FloatingActionButton = styled.div`
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 10;
`;

const CallHistory = ({ onClose, onCallContact, onVideoCallContact }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock call history data
  const callHistory = [
    {
      id: 1,
      contactId: 2,
      type: 'audio',
      direction: 'outgoing',
      status: 'completed',
      duration: '2:34',
      timestamp: '10:30 AM',
      date: 'Today'
    },
    {
      id: 2,
      contactId: 3,
      type: 'video',
      direction: 'incoming',
      status: 'missed',
      duration: '',
      timestamp: '9:15 AM',
      date: 'Today'
    },
    {
      id: 3,
      contactId: 5,
      type: 'audio',
      direction: 'outgoing',
      status: 'completed',
      duration: '0:45',
      timestamp: '8:20 AM',
      date: 'Today'
    },
    {
      id: 4,
      contactId: 4,
      type: 'audio',
      direction: 'incoming',
      status: 'completed',
      duration: '5:12',
      timestamp: '7:45 PM',
      date: 'Yesterday'
    },
    {
      id: 5,
      contactId: 2,
      type: 'video',
      direction: 'outgoing',
      status: 'completed',
      duration: '10:05',
      timestamp: '6:30 PM',
      date: 'Yesterday'
    },
    {
      id: 6,
      contactId: 10,
      type: 'audio',
      direction: 'incoming',
      status: 'missed',
      duration: '',
      timestamp: '3:15 PM',
      date: 'Yesterday'
    }
  ];
  
  const filteredCalls = callHistory.filter(call => {
    const contact = contacts.find(c => c.id === call.contactId);
    if (!contact) return false;
    
    return contact.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCallClick = (contactId, isVideo) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    if (isVideo) {
      if (onVideoCallContact) onVideoCallContact(contact);
    } else {
      if (onCallContact) onCallContact(contact);
    }
  };
  
  // Group calls by date
  const groupedCalls = filteredCalls.reduce((groups, call) => {
    const date = call.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(call);
    return groups;
  }, {});
  
  return (
    <HistoryContainer>
      <Header>
        <HeaderTitle>
          <BackButton onClick={onClose}>
            <FaArrowLeft />
          </BackButton>
          <h1>Calls</h1>
        </HeaderTitle>
        <HeaderActions>
          <ActionButton>
            <FaSearch />
          </ActionButton>
        </HeaderActions>
      </Header>
      
      <SearchContainer>
        <SearchInput>
          <FaSearch />
          <input 
            placeholder="Search calls"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </SearchInput>
      </SearchContainer>
      
      {Object.keys(groupedCalls).length > 0 ? (
        <CallsList>
          {Object.entries(groupedCalls).map(([date, calls]) => (
            <div key={date}>
              <div style={{ padding: '8px 16px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
                {date}
              </div>
              
              {calls.map(call => {
                const contact = contacts.find(c => c.id === call.contactId);
                if (!contact) return null;
                
                const isMissed = call.status === 'missed';
                const isIncoming = call.direction === 'incoming';
                
                return (
                  <CallItem key={call.id}>
                    <Avatar src={contact.avatar} alt={contact.name} />
                    <CallInfo>
                      <Name>{contact.name}</Name>
                      <CallDetails 
                        color={isMissed ? 'var(--danger-color)' : undefined}
                        incoming={isIncoming}
                      >
                        {isIncoming ? <FaPhoneAlt /> : <FaPhoneSlash />}
                        {isMissed ? 'Missed' : isIncoming ? 'Incoming' : 'Outgoing'}
                        {call.duration && ` • ${call.duration}`}
                      </CallDetails>
                    </CallInfo>
                    <CallTime>{call.timestamp}</CallTime>
                    <CallButton onClick={() => handleCallClick(contact.id, call.type === 'video')}>
                      {call.type === 'video' ? <FaVideo /> : <FaPhone />}
                    </CallButton>
                  </CallItem>
                );
              })}
            </div>
          ))}
        </CallsList>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <FaPhone />
          </EmptyStateIcon>
          <EmptyStateTitle>No calls yet</EmptyStateTitle>
          <EmptyStateText>
            {searchQuery 
              ? `No calls found for "${searchQuery}"`
              : "When you make or receive calls, they will appear here."}
          </EmptyStateText>
        </EmptyState>
      )}
      
      <FloatingActionButton>
        <FaPlus />
      </FloatingActionButton>
    </HistoryContainer>
  );
};

export default CallHistory;

