import React from 'react';
import styled from 'styled-components';
import { FaMicrophone } from 'react-icons/fa';
import AudioPlayer from './AudioPlayer';
import { formatAudioTime } from '../../utils/audioRecorder';

const VoiceMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 280px;
`;

const VoiceMessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

const VoiceIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--icon-color);
  margin-right: 8px;
`;

const VoiceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
  color: var(--text-secondary);
`;

const Duration = styled.span`
  font-weight: 500;
`;

const PlayerWrapper = styled.div`
  width: 100%;
`;

const VoiceMessage = ({ message, isSentByMe }) => {
  const { audio, duration } = message;
  
  return (
    <VoiceMessageContainer>
      <VoiceMessageHeader>
        <VoiceIcon>
          <FaMicrophone />
        </VoiceIcon>
        <VoiceInfo>
          <Duration>{formatAudioTime(duration || 0)}</Duration>
        </VoiceInfo>
      </VoiceMessageHeader>
      
      <PlayerWrapper>
        <AudioPlayer 
          audioUrl={audio} 
          isVoiceMessage={true} 
          showWaveform={true}
        />
      </PlayerWrapper>
    </VoiceMessageContainer>
  );
};

export default VoiceMessage;

