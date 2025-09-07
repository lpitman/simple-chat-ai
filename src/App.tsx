import React, { useState } from 'react';
import ChatContainer from './ChatContainer';
import LoginModal from './LoginModal';
import MessageContent from './MessageContent'; 
import { useChat } from './hooks/useChat'; 
import { useTheme } from './hooks/useTheme'; 
import type { Message } from './types/chat'; 
import './App.css';

// Determine if authentication is disabled via environment variable
const DISABLE_AUTH = import.meta.env.VITE_DISABLE_AUTH === 'true';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // If auth is disabled, always consider authenticated. Otherwise, check for token.
    return DISABLE_AUTH || !!localStorage.getItem('jwtToken');
  });

  const { currentThemeName, setTheme } = useTheme();

  const { messages, inputValue, isLoading, setInputValue, handleSubmit, clearMessages } = useChat({
    isAuthenticated,
    setIsAuthenticated,
    disableAuth: DISABLE_AUTH,
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleLoginSuccess = () => {
    if (!DISABLE_AUTH) { 
      setIsAuthenticated(true);
    }
    clearMessages(); 
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    if (!DISABLE_AUTH) { 
      setIsAuthenticated(false);
    }
    clearMessages(); 
  };

  const renderMessageContent = (message: Message) => {
    return <MessageContent message={{ text: message.text }} />;
  };

  return (
    <div className="app">
      {!isAuthenticated && !DISABLE_AUTH ? ( // Only show LoginModal if not authenticated AND auth is not disabled
        <LoginModal onLoginSuccess={handleLoginSuccess} />
      ) : (
        <ChatContainer 
          messages={messages}
          inputValue={inputValue}
          isLoading={isLoading}
          setInputValue={setInputValue}
          handleSubmit={handleSubmit}
          formatTime={formatTime}
          renderMessageContent={renderMessageContent}
          currentThemeName={currentThemeName} 
          setTheme={setTheme} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
};

export default App;
