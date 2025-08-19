import React from 'react';
import styled from 'styled-components';

const TypingContainer = styled.div`
  display: flex;
  align-items: center;
  color: var(--typing-indicator);
  font-size: 14px;
`;

const TypingText = styled.span`
  color: var(--text-secondary);
`;

const TypingDots = styled.div`
  display: flex;
  margin-left: 5px;
`;

const Dot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--typing-indicator);
  margin: 0 1px;
  animation: typing-animation 1.4s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;

  @keyframes typing-animation {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-5px);
    }
  }
`;

const TypingIndicator = ({ name }) => {
  return (
    <TypingContainer>
      <TypingText>{name ? `${name} is typing` : 'typing'}</TypingText>
      <TypingDots>
        <Dot delay={0} />
        <Dot delay={0.2} />
        <Dot delay={0.4} />
      </TypingDots>
    </TypingContainer>
  );
};

export default TypingIndicator;

