import React, { useState } from 'react';
import styled from 'styled-components';
import { FaImage, FaFile, FaLink } from 'react-icons/fa';
import { getChatByContactId } from '../../data/mockData';

const MediaContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--background-lighter);
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-color);
`;

const Tab = styled.div`
  flex: 1;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  color: ${props => props.isActive ? 'var(--primary-color)' : 'var(--text-secondary)'};
  border-bottom: 2px solid ${props => props.isActive ? 'var(--primary-color)' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  padding: 2px;
`;

const MediaItem = styled.div`
  aspect-ratio: 1;
  overflow: hidden;
  position: relative;
`;

const MediaImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DocumentsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const DocumentItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-background);
  }
`;

const DocumentIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${props => props.bgColor || '#E1F5FE'};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  
  svg {
    color: ${props => props.iconColor || '#039BE5'};
  }
`;

const DocumentInfo = styled.div`
  flex: 1;
`;

const DocumentName = styled.div`
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 4px;
`;

const DocumentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 12px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  color: var(--text-secondary);
  
  svg {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

const EmptyStateText = styled.div`
  font-size: 14px;
`;

const SharedMedia = ({ contactId }) => {
  const [activeTab, setActiveTab] = useState('media');
  const chat = getChatByContactId(contactId);
  
  // Extract media from chat messages
  const extractMedia = () => {
    if (!chat || !chat.messages) return [];
    
    return chat.messages
      .filter(msg => msg.attachment && msg.attachment.type === 'image')
      .map(msg => ({
        id: msg.id,
        url: msg.attachment.url,
        timestamp: msg.timestamp
      }));
  };
  
  // Extract documents from chat messages
  const extractDocuments = () => {
    if (!chat || !chat.messages) return [];
    
    return chat.messages
      .filter(msg => msg.attachment && msg.attachment.type === 'file')
      .map(msg => ({
        id: msg.id,
        name: msg.attachment.name,
        url: msg.attachment.url,
        size: msg.attachment.size,
        timestamp: msg.timestamp
      }));
  };
  
  // Extract links from chat messages
  const extractLinks = () => {
    if (!chat || !chat.messages) return [];
    
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    
    return chat.messages
      .filter(msg => msg.text && linkRegex.test(msg.text))
      .map(msg => {
        const match = msg.text.match(linkRegex);
        return {
          id: msg.id,
          url: match[0],
          text: msg.text,
          timestamp: msg.timestamp
        };
      });
  };
  
  const media = extractMedia();
  const documents = extractDocuments();
  const links = extractLinks();
  
  // For demo purposes, let's add some mock data
  const mockMedia = [
    { id: 'm1', url: 'https://source.unsplash.com/random/300x300?nature' },
    { id: 'm2', url: 'https://source.unsplash.com/random/300x300?city' },
    { id: 'm3', url: 'https://source.unsplash.com/random/300x300?people' },
    { id: 'm4', url: 'https://source.unsplash.com/random/300x300?food' },
    { id: 'm5', url: 'https://source.unsplash.com/random/300x300?technology' },
    { id: 'm6', url: 'https://source.unsplash.com/random/300x300?animals' }
  ];
  
  const mockDocuments = [
    { id: 'd1', name: 'Project_Report.pdf', size: 2500000, timestamp: '2023-08-15T14:30:00' },
    { id: 'd2', name: 'Meeting_Notes.docx', size: 350000, timestamp: '2023-08-10T09:15:00' },
    { id: 'd3', name: 'Budget_2023.xlsx', size: 1200000, timestamp: '2023-07-28T11:45:00' }
  ];
  
  const mockLinks = [
    { id: 'l1', url: 'https://example.com', text: 'Check out this website: https://example.com', timestamp: '2023-08-17T16:20:00' },
    { id: 'l2', url: 'https://news.example.com', text: 'Interesting article: https://news.example.com', timestamp: '2023-08-05T08:30:00' }
  ];
  
  const allMedia = [...media, ...mockMedia];
  const allDocuments = [...documents, ...mockDocuments];
  const allLinks = [...links, ...mockLinks];
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <MediaContainer>
      <TabsContainer>
        <Tab 
          isActive={activeTab === 'media'} 
          onClick={() => setActiveTab('media')}
        >
          Media
        </Tab>
        <Tab 
          isActive={activeTab === 'docs'} 
          onClick={() => setActiveTab('docs')}
        >
          Docs
        </Tab>
        <Tab 
          isActive={activeTab === 'links'} 
          onClick={() => setActiveTab('links')}
        >
          Links
        </Tab>
      </TabsContainer>
      
      {activeTab === 'media' && (
        allMedia.length > 0 ? (
          <MediaGrid>
            {allMedia.map(item => (
              <MediaItem key={item.id}>
                <MediaImage src={item.url} alt="Shared media" />
              </MediaItem>
            ))}
          </MediaGrid>
        ) : (
          <EmptyState>
            <FaImage />
            <EmptyStateText>No media shared</EmptyStateText>
          </EmptyState>
        )
      )}
      
      {activeTab === 'docs' && (
        allDocuments.length > 0 ? (
          <DocumentsList>
            {allDocuments.map(doc => (
              <DocumentItem key={doc.id}>
                <DocumentIcon>
                  <FaFile />
                </DocumentIcon>
                <DocumentInfo>
                  <DocumentName>{doc.name}</DocumentName>
                  <DocumentMeta>
                    <span>{formatFileSize(doc.size)}</span>
                    <span>{formatDate(doc.timestamp)}</span>
                  </DocumentMeta>
                </DocumentInfo>
              </DocumentItem>
            ))}
          </DocumentsList>
        ) : (
          <EmptyState>
            <FaFile />
            <EmptyStateText>No documents shared</EmptyStateText>
          </EmptyState>
        )
      )}
      
      {activeTab === 'links' && (
        allLinks.length > 0 ? (
          <DocumentsList>
            {allLinks.map(link => (
              <DocumentItem key={link.id}>
                <DocumentIcon bgColor="#E8F5E9" iconColor="#43A047">
                  <FaLink />
                </DocumentIcon>
                <DocumentInfo>
                  <DocumentName>{link.url}</DocumentName>
                  <DocumentMeta>
                    <span>{formatDate(link.timestamp)}</span>
                  </DocumentMeta>
                </DocumentInfo>
              </DocumentItem>
            ))}
          </DocumentsList>
        ) : (
          <EmptyState>
            <FaLink />
            <EmptyStateText>No links shared</EmptyStateText>
          </EmptyState>
        )
      )}
    </MediaContainer>
  );
};

export default SharedMedia;

