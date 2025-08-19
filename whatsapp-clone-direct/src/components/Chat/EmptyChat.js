import React from 'react';
import styled from 'styled-components';

const EmptyChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 70%;
  height: 100%;
  background-color: var(--chat-background);
  text-align: center;
  padding: 20px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const IllustrationContainer = styled.div`
  margin-bottom: 40px;
`;

const Illustration = styled.div`
  width: 250px;
  height: 250px;
  background-color: #f0f2f5;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 300;
  color: var(--text-primary);
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  max-width: 500px;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const EncryptionNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 40px;
`;

const LockIcon = styled.span`
  margin-right: 5px;
`;

const EmptyChat = () => {
  return (
    <EmptyChatContainer>
      <IllustrationContainer>
        <Illustration>
          <svg width="120" height="120" viewBox="0 0 303 172" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M229.565 160.229C262.212 149.245 286.931 118.241 283.39 73.4194C279.849 28.5975 219.923 -6.83317 185.569 1.15074C151.216 9.13466 143.921 65.0001 102.058 53.3586C60.1942 41.7172 -9.19012 14.7931 1.05058 69.8393C11.2913 124.885 60.8659 147.451 116.979 158.487C173.092 169.523 196.918 171.213 229.565 160.229Z" fill="#DAF7F3"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M168.12 23.5053C180.714 24.2284 188.569 14.1323 187.719 8.3817C186.868 2.63111 176.346 1.09425 164.409 0.3711C152.472 -0.352052 142.238 2.10866 143.088 7.85925C143.939 13.6098 155.525 22.7822 168.12 23.5053Z" fill="#DAF7F3"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M260.387 73.6451C272.982 74.3682 280.837 64.2721 279.986 58.5215C279.136 52.7709 268.614 51.234 256.677 50.5109C244.74 49.7878 234.506 52.2485 235.356 57.9991C236.207 63.7497 247.793 72.922 260.387 73.6451Z" fill="#DAF7F3"/>
          </svg>
        </Illustration>
      </IllustrationContainer>
      
      <Title>WhatsApp Web</Title>
      <Description>
        Send and receive messages without keeping your phone online.
        Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
      </Description>
      
      <EncryptionNote>
        <LockIcon>🔒</LockIcon>
        End-to-end encrypted
      </EncryptionNote>
    </EmptyChatContainer>
  );
};

export default EmptyChat;

