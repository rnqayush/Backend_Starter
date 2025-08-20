import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaFile, 
  FaFilePdf, 
  FaFileWord, 
  FaFileExcel, 
  FaFileImage, 
  FaFileVideo,
  FaFileAudio,
  FaFileArchive,
  FaFileCode,
  FaFilePowerpoint,
  FaDownload,
  FaEye,
  FaTimes
} from 'react-icons/fa';

const PreviewContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const PreviewHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: white;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
`;

const FileName = styled.div`
  margin-left: 10px;
  font-size: 16px;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
`;

const ActionButton = styled.div`
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const CloseButton = styled(ActionButton)`
  position: absolute;
  top: 10px;
  right: 20px;
  color: white;
  font-size: 20px;
`;

const PreviewContent = styled.div`
  max-width: 90%;
  max-height: 80%;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const VideoPreview = styled.video`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const AudioPreview = styled.audio`
  width: 100%;
  max-width: 500px;
`;

const DocumentPreview = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80%;
  max-width: 600px;
`;

const DocumentIcon = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  color: ${props => props.color || '#6E7B85'};
`;

const DocumentDetails = styled.div`
  text-align: center;
  color: #333;
`;

const DocumentName = styled.div`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 5px;
  word-break: break-word;
`;

const DocumentSize = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
`;

const DownloadButton = styled.a`
  background-color: #128C7E;
  color: white;
  padding: 10px 20px;
  border-radius: 24px;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  
  &:hover {
    background-color: #0C6B5D;
  }
  
  svg {
    margin-right: 8px;
  }
`;

const FilePreview = ({ file, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const getFileIcon = () => {
    const fileType = file.type || '';
    const fileName = file.name || '';
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (fileType.includes('pdf') || extension === 'pdf') {
      return <FaFilePdf color="#E74C3C" />;
    } else if (fileType.includes('word') || ['doc', 'docx'].includes(extension)) {
      return <FaFileWord color="#2B579A" />;
    } else if (fileType.includes('excel') || ['xls', 'xlsx', 'csv'].includes(extension)) {
      return <FaFileExcel color="#217346" />;
    } else if (fileType.includes('powerpoint') || ['ppt', 'pptx'].includes(extension)) {
      return <FaFilePowerpoint color="#D24726" />;
    } else if (fileType.includes('image')) {
      return <FaFileImage color="#3498DB" />;
    } else if (fileType.includes('video')) {
      return <FaFileVideo color="#9B59B6" />;
    } else if (fileType.includes('audio')) {
      return <FaFileAudio color="#F39C12" />;
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return <FaFileArchive color="#8E44AD" />;
    } else if (['html', 'css', 'js', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php'].includes(extension)) {
      return <FaFileCode color="#F1C40F" />;
    } else {
      return <FaFile color="#6E7B85" />;
    }
  };
  
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };
  
  const renderPreview = () => {
    const fileType = file.type || '';
    const url = file.url || (file instanceof File ? URL.createObjectURL(file) : '');
    
    if (fileType.includes('image')) {
      return <ImagePreview src={url} alt={file.name} />;
    } else if (fileType.includes('video')) {
      return (
        <VideoPreview controls>
          <source src={url} type={fileType} />
          Your browser does not support the video tag.
        </VideoPreview>
      );
    } else if (fileType.includes('audio')) {
      return (
        <AudioPreview controls>
          <source src={url} type={fileType} />
          Your browser does not support the audio tag.
        </AudioPreview>
      );
    } else {
      // Document preview
      return (
        <DocumentPreview>
          <DocumentIcon>{getFileIcon()}</DocumentIcon>
          <DocumentDetails>
            <DocumentName>{file.name}</DocumentName>
            <DocumentSize>{formatFileSize(file.size)}</DocumentSize>
            <DownloadButton 
              href={url} 
              download={file.name}
              onClick={(e) => {
                // For data URLs, we need to handle download differently
                if (url.startsWith('data:') && navigator.msSaveBlob) {
                  e.preventDefault();
                  const byteString = atob(url.split(',')[1]);
                  const mimeString = url.split(',')[0].split(':')[1].split(';')[0];
                  const ab = new ArrayBuffer(byteString.length);
                  const ia = new Uint8Array(ab);
                  for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                  }
                  const blob = new Blob([ab], { type: mimeString });
                  navigator.msSaveBlob(blob, file.name);
                }
              }}
            >
              <FaDownload /> Download
            </DownloadButton>
          </DocumentDetails>
        </DocumentPreview>
      );
    }
  };
  
  return (
    <PreviewContainer onClick={(e) => {
      // Close when clicking outside the content
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <PreviewHeader>
        <FileInfo>
          {getFileIcon()}
          <FileName>{file.name}</FileName>
        </FileInfo>
        <ActionButtons>
          <ActionButton title="Download" onClick={() => {
            const link = document.createElement('a');
            link.href = file.url || (file instanceof File ? URL.createObjectURL(file) : '');
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>
            <FaDownload />
          </ActionButton>
        </ActionButtons>
      </PreviewHeader>
      
      <PreviewContent>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          renderPreview()
        )}
      </PreviewContent>
      
      <CloseButton onClick={onClose}>
        <FaTimes />
      </CloseButton>
    </PreviewContainer>
  );
};

export default FilePreview;

