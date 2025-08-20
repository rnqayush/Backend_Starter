import React from 'react';
import styled from 'styled-components';

const StickerContainer = styled.div`
  position: relative;
  margin-bottom: 5px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  max-width: 150px;
  max-height: 150px;
`;

const StickerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const StickerMessage = ({ sticker }) => {
  // Default values if not provided
  const url = sticker.url || '';
  const name = sticker.name || 'Sticker';
  
  return (
    <StickerContainer>
      <StickerImage src={url} alt={name} />
    </StickerContainer>
  );
};

export default StickerMessage;

