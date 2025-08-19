import React, { useState } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaPhone, FaVideo, FaSearch, FaPlus } from 'react-icons/fa';
import { contacts } from '../../data/mockData';

const CallsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 30%;
  min-width: 300px;
  max-width: 450px;
  height: 100%;
  background-color: var(--sidebar-background);
  border-right: 1px solid var(--border-color);

  @media (max-width: 768px) {
    flex: 100%;
    max-width: 100%;
  }
`;

const CallsHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: var(--sidebar-header);
  height: 60px;
`;

const BackButton = styled.div`
  color: var(--icon-color);
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
`;

const IconButton = styled.div`
  color: var(--icon-color);
  font-size: 18px;
  margin-left: 20px;
  cursor: pointer;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const TabsContainer = styled.div`
  display: flex;
  background-color: var(--sidebar-header);
  border-bottom: 1px solid var(--border-color);
`;

const Tab = styled.div`
  flex: 1;
  padding: 15px 0;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  border-bottom: ${props => props.active ? '3px solid var(--primary-color)' : 'none'};
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
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

const CallAvatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
`;

const CallInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CallName = styled.div`
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const CallDetails = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: ${props => props.missed ? 'var(--error-color)' : 'var(--text-secondary)'};
`;

const CallIcon = styled.div`
  margin-right: 5px;
  transform: ${props => props.incoming ? 'rotate(135deg)' : 'rotate(-45deg)'};
`;

const CallTime = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
`;

const CallAction = styled.div`
  color: var(--primary-color);
  font-size: 20px;
  cursor: pointer;
  margin-left: 10px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  font-size: 50px;
  color: var(--text-secondary);
  margin-bottom: 20px;
`;

const EmptyStateTitle = styled.div`
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 10px;
`;

const EmptyStateText = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  max-width: 300px;
  line-height: 1.5;
`;

const FloatingActionButton = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  
  &:hover {
    background-color: #128C7E;
  }
`;

// Mock call data
const callHistory = [
  {
    id: 1,
    contactId: 2,
    type: 'video',
    direction: 'outgoing',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    duration: '5:23'
  },
  {
    id: 2,
    contactId: 3,
    type: 'audio',
    direction: 'incoming',
    status: 'missed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    duration: null
  },
  {
    id: 3,
    contactId: 5,
    type: 'audio',
    direction: 'outgoing',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    duration: '2:45'
  },
  {
    id: 4,
    contactId: 4,
    type: 'video',
    direction: 'incoming',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    duration: '10:12'
  }
];

const Calls = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [showNewCallMenu, setShowNewCallMenu] = useState(false);
  
  const formatCallTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };
  
  const getCallStatusText = (call) => {
    if (call.status === 'missed') {
      return 'Missed';
    } else {
      return `${call.direction === 'incoming' ? 'Incoming' : 'Outgoing'}, ${call.duration}`;
    }
  };
  
  const filteredCalls = activeTab === 'all' 
    ? callHistory 
    : callHistory.filter(call => call.status === 'missed');
  
  const handleNewCall = (type) => {
    // In a real app, this would open a contact picker
    console.log(`New ${type} call`);
    setShowNewCallMenu(false);
  };
  
  return (
    <CallsContainer>
      <CallsHeader>
        <BackButton onClick={onClose}>
          <FaArrowLeft />
        </BackButton>
        <HeaderTitle>Calls</HeaderTitle>
        <HeaderActions>
          <IconButton title="Search">
            <FaSearch />
          </IconButton>
        </HeaderActions>
      </CallsHeader>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'all'} 
          onClick={() => setActiveTab('all')}
        >
          All
        </Tab>
        <Tab 
          active={activeTab === 'missed'} 
          onClick={() => setActiveTab('missed')}
        >
          Missed
        </Tab>
      </TabsContainer>
      
      <CallsList>
        {filteredCalls.length > 0 ? (
          filteredCalls.map(call => {
            const contact = contacts.find(c => c.id === call.contactId);
            const isMissed = call.status === 'missed';
            const isIncoming = call.direction === 'incoming';
            
            return (
              <CallItem key={call.id}>
                <CallAvatar src={contact.avatar} alt={contact.name} />
                <CallInfo>
                  <CallName>{contact.name}</CallName>
                  <CallDetails missed={isMissed}>
                    <CallIcon incoming={isIncoming}>
                      {call.type === 'video' ? <FaVideo /> : <FaPhone />}
                    </CallIcon>
                    {getCallStatusText(call)}
                  </CallDetails>
                </CallInfo>
                <CallTime>{formatCallTime(call.timestamp)}</CallTime>
                <CallAction>
                  {call.type === 'video' ? <FaVideo /> : <FaPhone />}
                </CallAction>
              </CallItem>
            );
          })
        ) : (
          <EmptyState>
            <EmptyStateIcon>
              <FaPhone />
            </EmptyStateIcon>
            <EmptyStateTitle>No calls yet</EmptyStateTitle>
            <EmptyStateText>
              Start a call by tapping the call button in a chat or by using the new call button below.
            </EmptyStateText>
          </EmptyState>
        )}
      </CallsList>
      
      <FloatingActionButton onClick={() => setShowNewCallMenu(!showNewCallMenu)}>
        <FaPhone />
      </FloatingActionButton>
    </CallsContainer>
  );
};

export default Calls;

