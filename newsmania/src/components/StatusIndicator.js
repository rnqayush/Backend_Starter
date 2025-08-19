import React from 'react';
import styled from 'styled-components';
import { getStatusIcon, getStatusText } from '../utils/statusUtils';

const StatusContainer = styled.div`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-left: ${({ theme }) => theme.spacing.sm};
  
  background-color: ${({ theme, status }) => {
    switch (status) {
      case 'breaking':
        return theme.colors.error;
      case 'trending':
        return theme.colors.warning;
      case 'new':
        return theme.colors.info;
      case 'updated':
        return theme.colors.success;
      default:
        return theme.colors.lightGray;
    }
  }};
  
  color: ${({ theme, status }) => {
    return ['breaking', 'trending', 'new', 'updated'].includes(status) 
      ? theme.colors.white 
      : theme.colors.dark;
  }};
`;

const StatusIcon = styled.span`
  margin-right: ${({ theme }) => theme.spacing.xs};
`;

const StatusText = styled.span`
  text-transform: uppercase;
`;

const StatusIndicator = ({ status }) => {
  return (
    <StatusContainer status={status}>
      <StatusIcon>
        <i className={`fas ${getStatusIcon(status)}`}></i>
      </StatusIcon>
      <StatusText>{getStatusText(status)}</StatusText>
    </StatusContainer>
  );
};

export default StatusIndicator;
