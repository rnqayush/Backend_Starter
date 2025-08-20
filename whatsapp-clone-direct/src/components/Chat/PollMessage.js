import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPoll, FaCheck, FaChevronRight } from 'react-icons/fa';
import { useChat } from '../../contexts/ChatContext';
import { currentUser } from '../../data/mockData';
import GroupPoll from './GroupPoll';

const PollContainer = styled.div`
  background-color: ${props => props.isSentByMe ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
`;

const PollHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const PollIcon = styled.div`
  color: var(--primary-color);
  margin-right: 8px;
  font-size: 18px;
`;

const PollTitle = styled.div`
  font-weight: 500;
  font-size: 15px;
  color: var(--text-primary);
`;

const PollOptions = styled.div`
  margin-top: 8px;
`;

const PollOption = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const OptionText = styled.div`
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
`;

const OptionVotes = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-right: 8px;
`;

const OptionCheckmark = styled.div`
  color: var(--primary-color);
  margin-right: 8px;
  display: ${props => props.selected ? 'block' : 'none'};
`;

const PollFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
`;

const TotalVotes = styled.div``;

const ViewPoll = styled.div`
  display: flex;
  align-items: center;
  color: var(--primary-color);
  
  svg {
    margin-left: 4px;
  }
`;

const PollMessage = ({ poll, chatId, isSentByMe }) => {
  const [showFullPoll, setShowFullPoll] = useState(false);
  const { votePoll } = useChat();
  
  // If poll is not provided, use a default structure
  const pollData = poll || {
    id: 1,
    question: 'What time should we meet tomorrow?',
    options: [
      { id: 1, text: '10:00 AM', votes: 3, voters: [2, 5, 8] },
      { id: 2, text: '2:00 PM', votes: 2, voters: [3, 4] },
      { id: 3, text: '5:00 PM', votes: 1, voters: [10] }
    ],
    createdBy: 1,
    createdAt: '2023-08-19T14:30:00',
    allowMultipleVotes: false,
    showVoters: true,
    totalVotes: 6
  };
  
  const totalVotes = pollData.options.reduce((sum, option) => sum + option.votes, 0);
  
  // Check if current user has voted
  const hasVoted = pollData.options.some(option => 
    option.voters && option.voters.includes(currentUser.id)
  );
  
  // Get the options the current user voted for
  const userVotes = pollData.options
    .filter(option => option.voters && option.voters.includes(currentUser.id))
    .map(option => option.id);
  
  const handleVote = (optionId) => {
    if (hasVoted && !pollData.allowMultipleVotes) return;
    
    votePoll(chatId, pollData.id, [optionId]);
    
    // Update local state to show vote immediately
    const optionIndex = pollData.options.findIndex(o => o.id === optionId);
    if (optionIndex !== -1) {
      pollData.options[optionIndex].votes += 1;
      if (!pollData.options[optionIndex].voters) {
        pollData.options[optionIndex].voters = [];
      }
      pollData.options[optionIndex].voters.push(currentUser.id);
    }
  };
  
  const handleOpenFullPoll = () => {
    setShowFullPoll(true);
  };
  
  return (
    <>
      <PollContainer isSentByMe={isSentByMe} onClick={handleOpenFullPoll}>
        <PollHeader>
          <PollIcon>
            <FaPoll />
          </PollIcon>
          <PollTitle>{pollData.question}</PollTitle>
        </PollHeader>
        
        <PollOptions>
          {pollData.options.slice(0, 3).map(option => (
            <PollOption key={option.id} onClick={(e) => {
              e.stopPropagation();
              handleVote(option.id);
            }}>
              <OptionCheckmark selected={userVotes.includes(option.id)}>
                <FaCheck size={12} />
              </OptionCheckmark>
              <OptionText>{option.text}</OptionText>
              <OptionVotes>{option.votes} vote{option.votes !== 1 ? 's' : ''}</OptionVotes>
            </PollOption>
          ))}
          
          {pollData.options.length > 3 && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '8px 0' }}>
              +{pollData.options.length - 3} more options
            </div>
          )}
        </PollOptions>
        
        <PollFooter>
          <TotalVotes>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</TotalVotes>
          <ViewPoll>
            View poll <FaChevronRight size={10} />
          </ViewPoll>
        </PollFooter>
      </PollContainer>
      
      {showFullPoll && (
        <GroupPoll 
          chatId={chatId}
          pollId={pollData.id}
          mode="view"
          onClose={() => setShowFullPoll(false)}
        />
      )}
    </>
  );
};

export default PollMessage;

