import React from 'react';
import styled from 'styled-components';
import { getTimeRemaining, formatTimeRemaining, getExpirationColor } from '../../utils/statusUtils';

const TimeContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: ${props => props.color || 'var(--text-secondary)'};
  margin-top: 4px;
`;

const TimeIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.color || '#25D366'};
  margin-right: 6px;
`;

/**
 * Component to display the remaining time for a status
 * @param {Object} props
 * @param {string} props.timestamp - ISO timestamp of the status
 * @param {boolean} props.showIndicator - Whether to show the colored dot indicator
 * @param {boolean} props.showText - Whether to show the text description
 */
const StatusRemainingTime = ({ timestamp, showIndicator = true, showText = true }) => {
  // Calculate time remaining
  const timeRemaining = getTimeRemaining(timestamp);
  
  // Get color based on time remaining
  const color = getExpirationColor(timeRemaining);
  
  // Format time remaining as text
  const formattedTime = formatTimeRemaining(timeRemaining);
  
  // If no time remaining, don't render
  if (timeRemaining.percent === 0) {
    return null;
  }
  
  return (
    <TimeContainer color={color}>
      {showIndicator && <TimeIndicator color={color} />}
      {showText && formattedTime}
    </TimeContainer>
  );
};

export default StatusRemainingTime;

