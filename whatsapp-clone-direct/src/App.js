import React from 'react';
import './App.css';
import WhatsApp from './pages/WhatsApp';
import GlobalStyles from './styles/GlobalStyles';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <WhatsApp />
    </ThemeProvider>
  );
}

export default App;

