import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaImage, FaVideo, FaFile, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import FilePreview from './FilePreview';

const GalleryContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const GalleryHeader = styled.div`
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
`;

const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

const CloseButton = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const GalleryContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const GalleryPreview = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const PreviewImage = styled.img`
  max-width: 90%;
  max-height: 80%;
  object-fit: contain;
`;

const PreviewVideo = styled.video`
  max-width: 90%;
  max-height: 80%;
  object-fit: contain;
`;

const NavigationButton = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
  
  &.prev {
    left: 20px;
  }
  
  &.next {
    right: 20px;
  }
`;

const GalleryThumbnails = styled.div`
  height: 100px;
  display: flex;
  overflow-x: auto;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const Thumbnail = styled.div`
  width: 80px;
  height: 80px;
  margin-right: 10px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.isActive ? 'var(--primary-color)' : 'transparent'};
  position: relative;
  
  &:hover {
    opacity: 0.9;
  }
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbnailIcon = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
`;

const MediaGallery = ({ media, initialIndex = 0, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex]);
  
  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : media.length - 1));
  };
  
  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex < media.length - 1 ? prevIndex + 1 : 0));
  };
  
  const activeMedia = media[activeIndex];
  const isVideo = activeMedia.type && activeMedia.type.includes('video');
  
  const renderPreview = () => {
    if (isVideo) {
      return (
        <PreviewVideo controls autoPlay>
          <source src={activeMedia.url} type={activeMedia.type} />
          Your browser does not support the video tag.
        </PreviewVideo>
      );
    } else {
      return <PreviewImage src={activeMedia.url} alt={activeMedia.name} />;
    }
  };
  
  const getMediaTypeIcon = (mediaItem) => {
    const isVideoItem = mediaItem.type && mediaItem.type.includes('video');
    const isImageItem = mediaItem.type && mediaItem.type.includes('image');
    
    if (isVideoItem) {
      return <FaVideo />;
    } else if (isImageItem) {
      return <FaImage />;
    } else {
      return <FaFile />;
    }
  };
  
  return (
    <GalleryContainer>
      <GalleryHeader>
        <HeaderTitle>
          {activeIndex + 1} of {media.length} - {activeMedia.name || 'Media'}
        </HeaderTitle>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
      </GalleryHeader>
      
      <GalleryContent>
        <GalleryPreview>
          {renderPreview()}
          
          {media.length > 1 && (
            <>
              <NavigationButton className="prev" onClick={handlePrev}>
                <FaChevronLeft />
              </NavigationButton>
              <NavigationButton className="next" onClick={handleNext}>
                <FaChevronRight />
              </NavigationButton>
            </>
          )}
        </GalleryPreview>
        
        {media.length > 1 && (
          <GalleryThumbnails>
            {media.map((item, index) => (
              <Thumbnail 
                key={index} 
                isActive={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              >
                <ThumbnailImage 
                  src={item.type && item.type.includes('video') ? (item.thumbnail || item.url) : item.url} 
                  alt={item.name || `Media ${index + 1}`}
                />
                <ThumbnailIcon>
                  {getMediaTypeIcon(item)}
                </ThumbnailIcon>
              </Thumbnail>
            ))}
          </GalleryThumbnails>
        )}
      </GalleryContent>
    </GalleryContainer>
  );
};

export default MediaGallery;

