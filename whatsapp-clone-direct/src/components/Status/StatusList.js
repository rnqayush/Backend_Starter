import React from 'react';
import styled from 'styled-components';
import { FaPlus } from 'react-icons/fa';
import { useStory } from '../../contexts/StoryContext';
import { currentUser } from '../../data/mockData';

const StatusListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: var(--sidebar-background);
`;

const StatusSection = styled.div`
  margin-bottom: 10px;
`;

const SectionTitle = styled.div`
  padding: 15px 15px 5px;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--chat-hover);
  }
`;

const StatusAvatar = styled.div`
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
  border: ${props => props.hasUnviewed ? '2px solid var(--primary-color)' : props.hasStory ? '2px solid var(--text-secondary)' : 'none'};
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AddButton = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
`;

const StatusInfo = styled.div`
  flex: 1;
`;

const StatusName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const StatusTimestamp = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
`;

const EmptyList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  color: var(--text-secondary);
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 50px;
  color: var(--icon-color);
  margin-bottom: 15px;
`;

const EmptyText = styled.div`
  font-size: 16px;
  margin-bottom: 10px;
`;

const EmptySubtext = styled.div`
  font-size: 14px;
  opacity: 0.8;
`;

const StatusList = () => {
  const { stories, setActiveStory, setShowStoryViewer, hasUnviewedStories } = useStory();
  
  // Get all contacts with stories
  const contactsWithStories = stories.map(story => {
    const isCurrentUser = story.userId === currentUser.id;
    const contact = isCurrentUser ? currentUser : { id: story.userId, name: `User ${story.userId}`, avatar: `https://i.pravatar.cc/150?img=${story.userId}` };
    
    return {
      ...contact,
      hasStory: true,
      hasUnviewed: hasUnviewedStories(story.userId),
      timestamp: story.content[story.content.length - 1].timestamp,
      storyId: story.id
    };
  });
  
  // Separate recent updates and viewed updates
  const recentUpdates = contactsWithStories.filter(contact => contact.hasUnviewed);
  const viewedUpdates = contactsWithStories.filter(contact => !contact.hasUnviewed && contact.id !== currentUser.id);
  
  // Get current user's story
  const myStatus = contactsWithStories.find(contact => contact.id === currentUser.id);
  
  const handleStatusClick = (story) => {
    setActiveStory(stories.find(s => s.id === story.storyId));
    setShowStoryViewer(true);
  };
  
  if (contactsWithStories.length === 0) {
    return (
      <StatusListContainer>
        <EmptyList>
          <EmptyIcon>📱</EmptyIcon>
          <EmptyText>No status updates</EmptyText>
          <EmptySubtext>When contacts update their status, you'll see them here.</EmptySubtext>
        </EmptyList>
      </StatusListContainer>
    );
  }
  
  return (
    <StatusListContainer>
      {/* My Status */}
      <StatusSection>
        <SectionTitle>My Status</SectionTitle>
        <StatusItem onClick={() => myStatus && handleStatusClick(myStatus)}>
          <StatusAvatar hasStory={myStatus?.hasStory}>
            <Avatar src={currentUser.avatar} alt={currentUser.name} />
            <AddButton>
              <FaPlus />
            </AddButton>
          </StatusAvatar>
          <StatusInfo>
            <StatusName>My Status</StatusName>
            <StatusTimestamp>
              {myStatus ? 'Tap to view your status update' : 'Tap to add status update'}
            </StatusTimestamp>
          </StatusInfo>
        </StatusItem>
      </StatusSection>
      
      {/* Recent Updates */}
      {recentUpdates.length > 0 && (
        <StatusSection>
          <SectionTitle>Recent Updates</SectionTitle>
          {recentUpdates.map(contact => (
            <StatusItem key={contact.id} onClick={() => handleStatusClick(contact)}>
              <StatusAvatar hasUnviewed={contact.hasUnviewed}>
                <Avatar src={contact.avatar} alt={contact.name} />
              </StatusAvatar>
              <StatusInfo>
                <StatusName>{contact.name}</StatusName>
                <StatusTimestamp>
                  {new Date(contact.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </StatusTimestamp>
              </StatusInfo>
            </StatusItem>
          ))}
        </StatusSection>
      )}
      
      {/* Viewed Updates */}
      {viewedUpdates.length > 0 && (
        <StatusSection>
          <SectionTitle>Viewed Updates</SectionTitle>
          {viewedUpdates.map(contact => (
            <StatusItem key={contact.id} onClick={() => handleStatusClick(contact)}>
              <StatusAvatar hasStory={true}>
                <Avatar src={contact.avatar} alt={contact.name} />
              </StatusAvatar>
              <StatusInfo>
                <StatusName>{contact.name}</StatusName>
                <StatusTimestamp>
                  {new Date(contact.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </StatusTimestamp>
              </StatusInfo>
            </StatusItem>
          ))}
        </StatusSection>
      )}
    </StatusListContainer>
  );
};

export default StatusList;

