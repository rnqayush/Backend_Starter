import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlay, FaDownload, FaImage, FaVideo } from 'react-icons/fa';
import FilePreview from './FilePreview';

const MediaContainer = styled.div`
  position: relative;
  margin-bottom: 5px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  max-width: 300px;
`;

const MediaThumbnail = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  background-image: ${props => props.src ? `url(${props.src})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
`;

const MediaOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${MediaContainer}:hover & {
    opacity: 1;
  }
`;

const PlayButton = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
`;

const MediaInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MediaName = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const MediaSize = styled.div`
  margin-left: 8px;
`;

const DownloadButton = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const MediaTypeIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const MediaMessage = ({ media }) => {
  const [showPreview, setShowPreview] = useState(false);
  
  const isVideo = media.type && media.type.includes('video');
  const isImage = media.type && media.type.includes('image');
  
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };
  
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.name || 'media-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <>
      <MediaContainer onClick={() => setShowPreview(true)}>
        <MediaThumbnail src={isImage ? media.url : null}>
          {isVideo && !media.thumbnail && (
            <PlayButton>
              <FaPlay />
            </PlayButton>
          )}
          <MediaTypeIcon>
            {isVideo ? <FaVideo /> : <FaImage />}
          </MediaTypeIcon>
          <MediaOverlay>
            {isVideo && (
              <PlayButton>
                <FaPlay />
              </PlayButton>
            )}
          </MediaOverlay>
        </MediaThumbnail>
        <MediaInfo>
          <div style={{ display: 'flex', overflow: 'hidden' }}>
            <MediaName>{media.name || (isVideo ? 'Video' : 'Image')}</MediaName>
            <MediaSize>{formatFileSize(media.size)}</MediaSize>
          </div>
          <DownloadButton onClick={handleDownload} title="Download">
            <FaDownload />
          </DownloadButton>
        </MediaInfo>
      </MediaContainer>
      
      {showPreview && (
        <FilePreview 
          file={media} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </>
  );
};

export default MediaMessage;

