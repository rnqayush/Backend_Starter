import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaDownload, FaForward, FaStar, FaTrash } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
`;

const SenderInfo = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
`;

const SenderName = styled.div`
  font-size: 16px;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
`;

const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const Image = styled.img`
  max-width: 90%;
  max-height: 80vh;
  object-fit: contain;
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  margin: 0 15px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const ButtonLabel = styled.span`
  font-size: 12px;
  margin-top: 5px;
`;

const ImageViewerModal = ({ image, sender, onClose }) => {
  const handleDownload = () => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = image;
    link.download = 'whatsapp-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <Header>
          <SenderInfo>
            <Avatar src={sender.avatar} alt={sender.name} />
            <SenderName>{sender.name}</SenderName>
          </SenderInfo>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>
        
        <ImageContainer>
          <Image src={image} alt="Full size" />
        </ImageContainer>
        
        <Footer>
          <ActionButton onClick={handleDownload}>
            <FaDownload />
            <ButtonLabel>Download</ButtonLabel>
          </ActionButton>
          <ActionButton>
            <FaForward />
            <ButtonLabel>Forward</ButtonLabel>
          </ActionButton>
          <ActionButton>
            <FaStar />
            <ButtonLabel>Star</ButtonLabel>
          </ActionButton>
          <ActionButton>
            <FaTrash />
            <ButtonLabel>Delete</ButtonLabel>
          </ActionButton>
        </Footer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ImageViewerModal;

