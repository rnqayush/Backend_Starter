import React from 'react';

// Format message text to identify special formatting
export const formatMessageText = (text) => {
  if (!text) return [];
  
  // Define regex patterns for different formatting
  const boldPattern = /\*([^*]+)\*/g;
  const italicPattern = /_([^_]+)_/g;
  const strikethroughPattern = /~([^~]+)~/g;
  const codePattern = /```([^`]+)```/g;
  const linkPattern = /(https?:\/\/[^\s]+)/g;
  
  // Replace patterns with markers
  let formattedText = text
    .replace(boldPattern, '##BOLD_START##$1##BOLD_END##')
    .replace(italicPattern, '##ITALIC_START##$1##ITALIC_END##')
    .replace(strikethroughPattern, '##STRIKE_START##$1##STRIKE_END##')
    .replace(codePattern, '##CODE_START##$1##CODE_END##')
    .replace(linkPattern, '##LINK_START##$1##LINK_END##');
  
  // Split text by markers
  const parts = [];
  let currentText = '';
  let i = 0;
  
  while (i < formattedText.length) {
    if (formattedText.substring(i, i + 13) === '##BOLD_START##') {
      if (currentText) {
        parts.push({ type: 'text', content: currentText });
        currentText = '';
      }
      i += 13;
      let boldText = '';
      while (i < formattedText.length && formattedText.substring(i, i + 11) !== '##BOLD_END##') {
        boldText += formattedText[i];
        i++;
      }
      parts.push({ type: 'bold', content: boldText });
      i += 11;
    } else if (formattedText.substring(i, i + 15) === '##ITALIC_START##') {
      if (currentText) {
        parts.push({ type: 'text', content: currentText });
        currentText = '';
      }
      i += 15;
      let italicText = '';
      while (i < formattedText.length && formattedText.substring(i, i + 13) !== '##ITALIC_END##') {
        italicText += formattedText[i];
        i++;
      }
      parts.push({ type: 'italic', content: italicText });
      i += 13;
    } else if (formattedText.substring(i, i + 15) === '##STRIKE_START##') {
      if (currentText) {
        parts.push({ type: 'text', content: currentText });
        currentText = '';
      }
      i += 15;
      let strikeText = '';
      while (i < formattedText.length && formattedText.substring(i, i + 13) !== '##STRIKE_END##') {
        strikeText += formattedText[i];
        i++;
      }
      parts.push({ type: 'strikethrough', content: strikeText });
      i += 13;
    } else if (formattedText.substring(i, i + 13) === '##CODE_START##') {
      if (currentText) {
        parts.push({ type: 'text', content: currentText });
        currentText = '';
      }
      i += 13;
      let codeText = '';
      while (i < formattedText.length && formattedText.substring(i, i + 11) !== '##CODE_END##') {
        codeText += formattedText[i];
        i++;
      }
      parts.push({ type: 'code', content: codeText });
      i += 11;
    } else if (formattedText.substring(i, i + 13) === '##LINK_START##') {
      if (currentText) {
        parts.push({ type: 'text', content: currentText });
        currentText = '';
      }
      i += 13;
      let linkText = '';
      while (i < formattedText.length && formattedText.substring(i, i + 11) !== '##LINK_END##') {
        linkText += formattedText[i];
        i++;
      }
      parts.push({ type: 'link', content: linkText });
      i += 11;
    } else {
      currentText += formattedText[i];
      i++;
    }
  }
  
  if (currentText) {
    parts.push({ type: 'text', content: currentText });
  }
  
  return parts;
};

// Render formatted text parts
export const renderFormattedText = (parts) => {
  return parts.map((part, index) => {
    switch (part.type) {
      case 'bold':
        return <strong key={index}>{part.content}</strong>;
      case 'italic':
        return <em key={index}>{part.content}</em>;
      case 'strikethrough':
        return <del key={index}>{part.content}</del>;
      case 'code':
        return <code key={index} style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.1)', 
          padding: '2px 4px', 
          borderRadius: '3px',
          fontFamily: 'monospace'
        }}>{part.content}</code>;
      case 'link':
        return <a 
          key={index} 
          href={part.content} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'var(--primary-color)' }}
        >{part.content}</a>;
      default:
        return <span key={index}>{part.content}</span>;
    }
  });
};

