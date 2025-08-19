import React, { useState } from 'react';
import styled from 'styled-components';
import SidebarHeader from './SidebarHeader';
import SearchBar from './SearchBar';
import ChatList from './ChatList';
import Status from '../Status/Status';
import { contacts } from '../../data/mockData';

const SidebarContainer = styled.div`
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
    display: ${props => props.isChatOpen ? 'none' : 'flex'};
  }
`;

const Sidebar = ({ setSelectedContact, selectedContact, isChatOpen, setIsChatOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setIsChatOpen(true);
  };
  
  const handleStatusClick = () => {
    setShowStatus(true);
  };
  
  const handleStatusClose = () => {
    setShowStatus(false);
  };

  return (
    <SidebarContainer isChatOpen={isChatOpen}>
      {showStatus ? (
        <Status onClose={handleStatusClose} />
      ) : (
        <>
          <SidebarHeader onStatusClick={handleStatusClick} />
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <ChatList 
            contacts={filteredContacts} 
            onContactSelect={handleContactSelect}
            selectedContactId={selectedContact?.id}
          />
        </>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;
