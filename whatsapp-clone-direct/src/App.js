import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import WhatsApp from './pages/WhatsApp';
import GlobalStyles from './styles/GlobalStyles';
import { ThemeProvider } from './contexts/ThemeContext';
import { StoryProvider } from './contexts/StoryContext';
import { ChatProvider } from './contexts/ChatContext';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ChatProvider>
          <StoryProvider>
            <GlobalStyles />
            <Routes>
              <Route path="/" element={<WhatsApp />} />
            </Routes>
          </StoryProvider>
        </ChatProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
