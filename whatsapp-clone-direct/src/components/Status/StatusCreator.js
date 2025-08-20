import React from 'react';
import TextStatusCreator from './TextStatusCreator';
import ImageStatusCreator from './ImageStatusCreator';

const StatusCreator = ({ type, onClose }) => {
  return type === 'text' ? (
    <TextStatusCreator onClose={onClose} />
  ) : (
    <ImageStatusCreator onClose={onClose} />
  );
};

export default StatusCreator;

