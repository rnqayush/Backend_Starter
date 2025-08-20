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
  FaDownload
} from 'react-icons/fa';
import FilePreview from './FilePreview';

const DocumentContainer = styled.div`
  display: flex;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
`;

const DocumentIconContainer = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 24px;
  color: ${props => props.color || '#6E7B85'};
`;

const DocumentInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
`;

const DocumentName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DocumentMeta = styled.div`
  display: flex;
  align-items: center;
  margin-top: 2px;
`;

const DocumentSize = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const DocumentType = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 8px;
  text-transform: uppercase;
`;

const DownloadButton = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  border-radius: 50%;
  margin-left: 8px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const DocumentMessage = ({ document }) => {
  const [showPreview, setShowPreview] = useState(false);
  
  const getFileIcon = () => {
    const fileType = document.type || '';
    const fileName = document.name || '';
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
  
  const getFileIconColor = () => {
    const fileType = document.type || '';
    const fileName = document.name || '';
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (fileType.includes('pdf') || extension === 'pdf') {
      return "#E74C3C";
    } else if (fileType.includes('word') || ['doc', 'docx'].includes(extension)) {
      return "#2B579A";
    } else if (fileType.includes('excel') || ['xls', 'xlsx', 'csv'].includes(extension)) {
      return "#217346";
    } else if (fileType.includes('powerpoint') || ['ppt', 'pptx'].includes(extension)) {
      return "#D24726";
    } else if (fileType.includes('image')) {
      return "#3498DB";
    } else if (fileType.includes('video')) {
      return "#9B59B6";
    } else if (fileType.includes('audio')) {
      return "#F39C12";
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return "#8E44AD";
    } else if (['html', 'css', 'js', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php'].includes(extension)) {
      return "#F1C40F";
    } else {
      return "#6E7B85";
    }
  };
  
  const getFileType = () => {
    const fileType = document.type || '';
    const fileName = document.name || '';
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (fileType.includes('pdf') || extension === 'pdf') {
      return "PDF";
    } else if (fileType.includes('word') || ['doc', 'docx'].includes(extension)) {
      return extension.toUpperCase();
    } else if (fileType.includes('excel') || ['xls', 'xlsx', 'csv'].includes(extension)) {
      return extension.toUpperCase();
    } else if (fileType.includes('powerpoint') || ['ppt', 'pptx'].includes(extension)) {
      return extension.toUpperCase();
    } else if (fileType.includes('image')) {
      return extension.toUpperCase();
    } else if (fileType.includes('video')) {
      return extension.toUpperCase();
    } else if (fileType.includes('audio')) {
      return extension.toUpperCase();
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return extension.toUpperCase();
    } else {
      return extension.toUpperCase();
    }
  };
  
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };
  
  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <>
      <DocumentContainer onClick={() => setShowPreview(true)}>
        <DocumentIconContainer color={getFileIconColor()}>
          {getFileIcon()}
        </DocumentIconContainer>
        <DocumentInfo>
          <DocumentName>{document.name}</DocumentName>
          <DocumentMeta>
            <DocumentSize>{formatFileSize(document.size)}</DocumentSize>
            <DocumentType>{getFileType()}</DocumentType>
          </DocumentMeta>
        </DocumentInfo>
        <DownloadButton onClick={handleDownload} title="Download">
          <FaDownload />
        </DownloadButton>
      </DocumentContainer>
      
      {showPreview && (
        <FilePreview 
          file={document} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </>
  );
};

export default DocumentMessage;

