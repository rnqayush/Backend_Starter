import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaTimes, 
  FaCheck, 
  FaTrash,
  FaEdit,
  FaPoll,
  FaEllipsisV
} from 'react-icons/fa';
import { useChat } from '../../contexts/ChatContext';
import { currentUser } from '../../data/mockData';

const PollContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--background);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
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

const PollCreationContainer = styled.div`
  padding: 20px;
  flex: 1;
  overflow-y: auto;
`;

const PollQuestion = styled.input`
  width: 100%;
  padding: 12px;
  border: none;
  border-bottom: 2px solid var(--primary-color);
  background-color: transparent;
  color: var(--text-primary);
  font-size: 18px;
  margin-bottom: 20px;
  outline: none;
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const OptionsContainer = styled.div`
  margin-bottom: 20px;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
`;

const OptionInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-lighter);
  color: var(--text-primary);
  font-size: 16px;
  outline: none;
  
  &:focus {
    border-color: var(--primary-color);
  }
`;

const OptionNumber = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-right: 12px;
`;

const RemoveOptionButton = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  
  &:hover {
    color: var(--danger-color);
  }
`;

const AddOptionButton = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  color: var(--primary-color);
  cursor: pointer;
  
  svg {
    margin-right: 8px;
  }
`;

const PollSettings = styled.div`
  margin-bottom: 20px;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
`;

const SettingLabel = styled.div`
  color: var(--text-primary);
`;

const ToggleSwitch = styled.div`
  width: 40px;
  height: 20px;
  background-color: ${props => props.isOn ? 'var(--primary-color)' : 'var(--text-secondary)'};
  border-radius: 10px;
  position: relative;
  transition: background-color 0.2s ease;
  cursor: pointer;
  
  &:after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.isOn ? '22px' : '2px'};
    width: 16px;
    height: 16px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.2s ease;
  }
`;

const CreateButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: var(--primary-color-dark);
  }
  
  &:disabled {
    background-color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

// Poll Viewing Components
const PollViewContainer = styled.div`
  padding: 20px;
  flex: 1;
  overflow-y: auto;
`;

const PollTitle = styled.div`
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 16px;
`;

const PollInfo = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 20px;
`;

const PollCreator = styled.div``;

const PollDate = styled.div``;

const PollOptions = styled.div`
  margin-bottom: 20px;
`;

const PollOption = styled.div`
  margin-bottom: 16px;
`;

const OptionBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
`;

const OptionText = styled.div`
  flex: 1;
  color: var(--text-primary);
  font-size: 16px;
`;

const OptionCheckbox = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? 'var(--primary-color)' : 'var(--border-color)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background-color: ${props => props.selected ? 'var(--primary-color)' : 'transparent'};
  color: white;
  transition: all 0.2s;
`;

const ProgressBarContainer = styled.div`
  height: 8px;
  background-color: var(--background-lighter);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${props => props.percentage}%;
  background-color: var(--primary-color);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const OptionStats = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 4px;
`;

const VotersCount = styled.div``;

const VotePercentage = styled.div``;

const TotalVotes = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 20px;
`;

const VotersList = styled.div`
  margin-top: 20px;
`;

const VotersTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 12px;
`;

const VoterItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }
`;

const VoterAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
`;

const VoterInfo = styled.div`
  flex: 1;
`;

const VoterName = styled.div`
  color: var(--text-primary);
  font-size: 16px;
`;

const VoterVote = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
`;

const GroupPoll = ({ chatId, pollId, mode = 'create', onClose }) => {
  // For poll creation
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [showVoters, setShowVoters] = useState(true);
  
  // For poll viewing
  const [poll, setPoll] = useState(pollId ? {
    id: pollId,
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
  } : null);
  
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showAllVoters, setShowAllVoters] = useState(false);
  
  const { addPoll, votePoll } = useChat();
  
  const handleAddOption = () => {
    setOptions([...options, '']);
  };
  
  const handleRemoveOption = (index) => {
    if (options.length <= 2) return;
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };
  
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const handleCreatePoll = () => {
    // Filter out empty options
    const validOptions = options.filter(option => option.trim() !== '');
    
    if (question.trim() === '' || validOptions.length < 2) return;
    
    const newPoll = {
      question: question.trim(),
      options: validOptions.map((option, index) => ({
        id: index + 1,
        text: option.trim(),
        votes: 0,
        voters: []
      })),
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      allowMultipleVotes,
      showVoters
    };
    
    addPoll(chatId, newPoll);
    onClose();
  };
  
  const handleVote = (optionId) => {
    if (!poll) return;
    
    if (poll.allowMultipleVotes) {
      // Toggle selection for multiple votes
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    } else {
      // Single vote
      setSelectedOptions([optionId]);
      
      // Submit vote immediately for single-vote polls
      votePoll(chatId, poll.id, [optionId]);
      
      // Update local state to show vote immediately
      const updatedPoll = { ...poll };
      updatedPoll.options = poll.options.map(option => {
        if (option.id === optionId) {
          return {
            ...option,
            votes: option.votes + 1,
            voters: [...option.voters, currentUser.id]
          };
        }
        return option;
      });
      updatedPoll.totalVotes = (poll.totalVotes || 0) + 1;
      setPoll(updatedPoll);
    }
  };
  
  const handleSubmitVotes = () => {
    if (!poll || selectedOptions.length === 0) return;
    
    votePoll(chatId, poll.id, selectedOptions);
    
    // Update local state to show votes immediately
    const updatedPoll = { ...poll };
    updatedPoll.options = poll.options.map(option => {
      if (selectedOptions.includes(option.id)) {
        return {
          ...option,
          votes: option.votes + 1,
          voters: [...option.voters, currentUser.id]
        };
      }
      return option;
    });
    updatedPoll.totalVotes = (poll.totalVotes || 0) + selectedOptions.length;
    setPoll(updatedPoll);
    
    setSelectedOptions([]);
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const hasVoted = () => {
    if (!poll) return false;
    return poll.options.some(option => option.voters.includes(currentUser.id));
  };
  
  const getVoterName = (voterId) => {
    if (voterId === currentUser.id) return 'You';
    const voter = { 
      2: 'Sarah Johnson',
      3: 'Michael Brown',
      4: 'Emily Davis',
      5: 'David Wilson',
      8: 'James Anderson',
      10: 'Daniel Thompson'
    }[voterId];
    return voter || `User ${voterId}`;
  };
  
  const getVoterAvatar = (voterId) => {
    return `https://randomuser.me/api/portraits/${voterId % 2 === 0 ? 'women' : 'men'}/${voterId}.jpg`;
  };
  
  return (
    <PollContainer>
      <Header>
        <HeaderTitle>
          <BackButton onClick={onClose}>
            <FaArrowLeft />
          </BackButton>
          <h1>{mode === 'create' ? 'Create poll' : 'Poll'}</h1>
        </HeaderTitle>
        {mode === 'view' && (
          <HeaderActions>
            <ActionButton>
              <FaEllipsisV />
            </ActionButton>
          </HeaderActions>
        )}
      </Header>
      
      {mode === 'create' ? (
        <PollCreationContainer>
          <PollQuestion 
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            autoFocus
          />
          
          <OptionsContainer>
            {options.map((option, index) => (
              <OptionItem key={index}>
                <OptionNumber>{index + 1}</OptionNumber>
                <OptionInput 
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                {options.length > 2 && (
                  <RemoveOptionButton onClick={() => handleRemoveOption(index)}>
                    <FaTimes />
                  </RemoveOptionButton>
                )}
              </OptionItem>
            ))}
          </OptionsContainer>
          
          <AddOptionButton onClick={handleAddOption}>
            <FaPlus />
            Add option
          </AddOptionButton>
          
          <PollSettings>
            <SettingItem>
              <SettingLabel>Allow multiple answers</SettingLabel>
              <ToggleSwitch 
                isOn={allowMultipleVotes}
                onClick={() => setAllowMultipleVotes(!allowMultipleVotes)}
              />
            </SettingItem>
            <SettingItem>
              <SettingLabel>Show who voted for what</SettingLabel>
              <ToggleSwitch 
                isOn={showVoters}
                onClick={() => setShowVoters(!showVoters)}
              />
            </SettingItem>
          </PollSettings>
          
          <CreateButton 
            onClick={handleCreatePoll}
            disabled={question.trim() === '' || options.filter(o => o.trim() !== '').length < 2}
          >
            Create Poll
          </CreateButton>
        </PollCreationContainer>
      ) : (
        <PollViewContainer>
          {poll && (
            <>
              <PollTitle>{poll.question}</PollTitle>
              
              <PollInfo>
                <PollCreator>Created by {poll.createdBy === currentUser.id ? 'you' : getVoterName(poll.createdBy)}</PollCreator>
                <PollDate>{formatDate(poll.createdAt)}</PollDate>
              </PollInfo>
              
              <PollOptions>
                {poll.options.map(option => {
                  const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                  const isSelected = selectedOptions.includes(option.id);
                  const hasUserVoted = option.voters.includes(currentUser.id);
                  
                  return (
                    <PollOption key={option.id}>
                      <OptionBar onClick={() => !hasVoted() && handleVote(option.id)}>
                        <OptionCheckbox selected={isSelected || hasUserVoted}>
                          {(isSelected || hasUserVoted) && <FaCheck size={12} />}
                        </OptionCheckbox>
                        <OptionText>{option.text}</OptionText>
                      </OptionBar>
                      
                      <ProgressBarContainer>
                        <ProgressBar percentage={percentage} />
                      </ProgressBarContainer>
                      
                      <OptionStats>
                        <VotersCount>{option.votes} vote{option.votes !== 1 ? 's' : ''}</VotersCount>
                        <VotePercentage>{percentage}%</VotePercentage>
                      </OptionStats>
                    </PollOption>
                  );
                })}
              </PollOptions>
              
              {poll.allowMultipleVotes && selectedOptions.length > 0 && !hasVoted() && (
                <CreateButton onClick={handleSubmitVotes}>
                  Vote
                </CreateButton>
              )}
              
              <TotalVotes>
                {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
              </TotalVotes>
              
              {poll.showVoters && (
                <VotersList>
                  <VotersTitle>Voters</VotersTitle>
                  
                  {poll.options.flatMap(option => 
                    option.voters.slice(0, showAllVoters ? option.voters.length : 3).map(voterId => (
                      <VoterItem key={`${option.id}-${voterId}`}>
                        <VoterAvatar src={getVoterAvatar(voterId)} alt={getVoterName(voterId)} />
                        <VoterInfo>
                          <VoterName>{getVoterName(voterId)}</VoterName>
                          <VoterVote>Voted for: {option.text}</VoterVote>
                        </VoterInfo>
                      </VoterItem>
                    ))
                  )}
                  
                  {!showAllVoters && poll.totalVotes > 3 && (
                    <div 
                      style={{ 
                        textAlign: 'center', 
                        padding: '12px', 
                        color: 'var(--primary-color)', 
                        cursor: 'pointer' 
                      }}
                      onClick={() => setShowAllVoters(true)}
                    >
                      Show all voters
                    </div>
                  )}
                </VotersList>
              )}
            </>
          )}
        </PollViewContainer>
      )}
    </PollContainer>
  );
};

export default GroupPoll;

