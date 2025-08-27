import React, { useState } from 'react';
import ChatContainer from './ChatContainer';
import LoginModal from './LoginModal';
import MessageContent from './MessageContent'; // Still needed for renderMessageContent
import { useChat } from './hooks/useChat'; // Import the new chat hook
import { useTheme } from './hooks/useTheme'; // Import the new theme hook
import { Message } from './types/chat'; // Import Message interface
import './App.css';

// Determine if authentication is disabled via environment variable
const DISABLE_AUTH = import.meta.env.VITE_DISABLE_AUTH === 'true';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // If auth is disabled, always consider authenticated. Otherwise, check for token.
    return DISABLE_AUTH || !!localStorage.getItem('jwtToken');
  });

  // Use the custom theme hook
  const { currentThemeName, setTheme } = useTheme();

  // Use the custom chat hook, passing necessary props
  const { messages, inputValue, isLoading, setInputValue, handleSubmit, clearMessages } = useChat({
    isAuthenticated,
    setIsAuthenticated,
    disableAuth: DISABLE_AUTH,
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleLoginSuccess = () => {
    if (!DISABLE_AUTH) { // Only set isAuthenticated if auth is enabled
      setIsAuthenticated(true);
    }
    clearMessages(); // Clear messages on successful login
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    if (!DISABLE_AUTH) { // Only set isAuthenticated if auth is enabled
      setIsAuthenticated(false);
    }
    clearMessages(); // Clear messages on logout
  };

  // Create a proper render function that doesn't use hooks directly
  const renderMessageContent = (message: Message) => {
    // MessageContent expects { text: string }, so we pass the 'text' property
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
          currentThemeName={currentThemeName} // Pass current theme name
          setTheme={setTheme} // Pass set theme function
          onLogout={handleLogout} // Pass logout function
        />
      )}
    </div>
  );
};

export default App;
