import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import WhatsApp from './pages/WhatsApp';
import GlobalStyles from './styles/GlobalStyles';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <GlobalStyles />
        <Routes>
          <Route path="/" element={<WhatsApp />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

