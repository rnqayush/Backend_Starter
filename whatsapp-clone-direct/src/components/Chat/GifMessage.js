import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause, FaDownload } from 'react-icons/fa';
import FilePreview from './FilePreview';

const GifContainer = styled.div`
  position: relative;
  margin-bottom: 5px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  max-width: 300px;
`;

const GifPreview = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  overflow: hidden;
`;

const GifImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const GifVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const GifOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.2s;
  
  ${GifContainer}:hover & {
    opacity: 1;
  }
`;

const ControlButton = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
`;

const GifInfo = styled.div`
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

const GifBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
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

const GifMessage = ({ gif }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);
  
  // Default values if not provided
  const url = gif.url || '';
  const name = gif.name || 'GIF';
  const isMP4 = url.endsWith('.mp4') || gif.type === 'video/mp4';
  
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(e => console.error('Error playing video:', e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  const handlePlayPause = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };
  
  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <>
      <GifContainer 
        onClick={() => setShowPreview(true)}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <GifPreview>
          {isMP4 ? (
            <GifVideo 
              ref={videoRef}
              src={url}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <GifImage src={url} alt={name} />
          )}
          <GifBadge>GIF</GifBadge>
          <GifOverlay show={showControls}>
            {isMP4 && (
              <ControlButton onClick={handlePlayPause}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </ControlButton>
            )}
          </GifOverlay>
        </GifPreview>
        <GifInfo>
          <div>{name}</div>
          <DownloadButton onClick={handleDownload} title="Download">
            <FaDownload />
          </DownloadButton>
        </GifInfo>
      </GifContainer>
      
      {showPreview && (
        <FilePreview 
          file={{
            name,
            url,
            type: isMP4 ? 'video/mp4' : 'image/gif'
          }} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </>
  );
};

export default GifMessage;

