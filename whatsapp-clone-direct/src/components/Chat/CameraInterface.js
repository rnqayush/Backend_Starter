import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaCamera, 
  FaVideo, 
  FaTimes, 
  FaCircle, 
  FaStop, 
  FaUndo, 
  FaPaperPlane,
  FaImage,
  FaChevronDown
} from 'react-icons/fa';

const CameraContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const CameraHeader = styled.div`
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: white;
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

const CameraViewfinder = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VideoPreview = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CapturedImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const CapturedVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #000;
`;

const CameraControls = styled.div`
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 20px;
  background-color: rgba(0, 0, 0, 0.7);
`;

const CameraButton = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${props => props.isRecording ? 'rgba(255, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.2)'};
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.isRecording ? 'rgba(255, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const CameraButtonInner = styled.div`
  width: ${props => props.isRecording ? '30px' : '60px'};
  height: ${props => props.isRecording ? '30px' : '60px'};
  border-radius: ${props => props.isRecording ? '5px' : '50%'};
  background-color: ${props => props.isRecording ? 'red' : 'white'};
`;

const ModeButton = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 20px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  &.active {
    color: var(--primary-color);
  }
`;

const FlashOptions = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FlashButton = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  margin-bottom: 10px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const FlashMenu = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  padding: 10px;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const FlashOption = styled.div`
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &.active {
    color: var(--primary-color);
  }
`;

const RecordingTimer = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
  
  .dot {
    width: 8px;
    height: 8px;
    background-color: red;
    border-radius: 50%;
    margin-right: 8px;
    animation: blink 1s infinite;
  }
  
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const GalleryButton = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  overflow: hidden;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const GalleryThumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CaptureOptions = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
`;

const CaptureOptionButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  cursor: pointer;
  
  svg {
    font-size: 24px;
    margin-bottom: 5px;
  }
  
  span {
    font-size: 12px;
  }
  
  &:hover {
    color: var(--primary-color);
  }
`;

const CameraInterface = ({ onCapture, onClose }) => {
  const [mode, setMode] = useState('photo'); // 'photo' or 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [flashMode, setFlashMode] = useState('auto'); // 'auto', 'on', 'off'
  const [showFlashOptions, setShowFlashOptions] = useState(false);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  
  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: mode === 'video'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please check permissions.');
    }
  };
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };
  
  const switchMode = (newMode) => {
    if (newMode === mode) return;
    
    setMode(newMode);
    stopCamera();
    
    // Reset states
    setCapturedImage(null);
    setCapturedVideo(null);
    setIsRecording(false);
    
    // Restart camera with new constraints
    setTimeout(startCamera, 300);
  };
  
  const toggleFlashOptions = () => {
    setShowFlashOptions(!showFlashOptions);
  };
  
  const setFlash = (mode) => {
    setFlashMode(mode);
    setShowFlashOptions(false);
    
    // In a real app, we would apply the flash mode to the camera
    // This would require additional implementation with the MediaStream API
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);
  };
  
  const startVideoRecording = () => {
    if (!streamRef.current) return;
    
    recordedChunksRef.current = [];
    
    try {
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm'
        });
        const videoUrl = URL.createObjectURL(blob);
        setCapturedVideo(videoUrl);
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting video recording:', err);
      alert('Could not start video recording.');
    }
  };
  
  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  const handleCameraButtonClick = () => {
    if (mode === 'photo') {
      capturePhoto();
    } else {
      if (isRecording) {
        stopVideoRecording();
      } else {
        startVideoRecording();
      }
    }
  };
  
  const retakeMedia = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
  };
  
  const sendMedia = () => {
    if (capturedImage) {
      onCapture({
        type: 'image',
        data: capturedImage,
        name: `Photo_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`
      });
    } else if (capturedVideo) {
      onCapture({
        type: 'video',
        data: capturedVideo,
        name: `Video_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`
      });
    }
    onClose();
  };
  
  return (
    <CameraContainer>
      <CameraHeader>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
      </CameraHeader>
      
      <CameraViewfinder>
        {!capturedImage && !capturedVideo && (
          <VideoPreview 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
          />
        )}
        
        {capturedImage && (
          <CapturedImage src={capturedImage} alt="Captured" />
        )}
        
        {capturedVideo && (
          <CapturedVideo 
            src={capturedVideo} 
            controls 
            autoPlay 
          />
        )}
        
        {isRecording && (
          <RecordingTimer>
            <div className="dot"></div>
            {formatTime(recordingTime)}
          </RecordingTimer>
        )}
        
        <FlashOptions>
          <FlashButton onClick={toggleFlashOptions}>
            <FaChevronDown />
          </FlashButton>
          <FlashMenu isOpen={showFlashOptions}>
            <FlashOption 
              className={flashMode === 'auto' ? 'active' : ''}
              onClick={() => setFlash('auto')}
            >
              Auto
            </FlashOption>
            <FlashOption 
              className={flashMode === 'on' ? 'active' : ''}
              onClick={() => setFlash('on')}
            >
              On
            </FlashOption>
            <FlashOption 
              className={flashMode === 'off' ? 'active' : ''}
              onClick={() => setFlash('off')}
            >
              Off
            </FlashOption>
          </FlashMenu>
        </FlashOptions>
        
        <GalleryButton>
          <FaImage />
        </GalleryButton>
      </CameraViewfinder>
      
      <CameraControls>
        {capturedImage || capturedVideo ? (
          <CaptureOptions>
            <CaptureOptionButton onClick={retakeMedia}>
              <FaUndo />
              <span>Retake</span>
            </CaptureOptionButton>
            <CaptureOptionButton onClick={sendMedia}>
              <FaPaperPlane />
              <span>Send</span>
            </CaptureOptionButton>
          </CaptureOptions>
        ) : (
          <>
            <ModeButton 
              className={mode === 'photo' ? 'active' : ''}
              onClick={() => switchMode('photo')}
            >
              <FaCamera />
            </ModeButton>
            
            <CameraButton 
              onClick={handleCameraButtonClick}
              isRecording={isRecording}
            >
              <CameraButtonInner isRecording={isRecording} />
            </CameraButton>
            
            <ModeButton 
              className={mode === 'video' ? 'active' : ''}
              onClick={() => switchMode('video')}
            >
              <FaVideo />
            </ModeButton>
          </>
        )}
      </CameraControls>
    </CameraContainer>
  );
};

export default CameraInterface;

