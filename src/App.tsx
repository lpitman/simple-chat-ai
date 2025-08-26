import React, { useState, useEffect } from 'react';
import ChatContainer from './ChatContainer';
import MessageContent from './MessageContent';
import './App.css';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Array<{
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
  }>>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Determine the backend base URL dynamically
    let backendBaseUrl: string;
    if (import.meta.env.DEV) {
      // In development, use localhost:3001 as the backend runs on a different port
      backendBaseUrl = 'http://localhost:3001';
    } else {
      // In production, assume the API is proxied under /api on the same host and port.
      // An empty string means a relative path, e.g., /api/generate
      backendBaseUrl = ''; 
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send request to the new backend endpoint
      const response = await fetch(`${backendBaseUrl}/api/generate`, { // Updated URL construction
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen3',
          prompt: inputValue,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI message
      const aiMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'ai' as const,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Create a proper render function that doesn't use hooks directly
  const renderMessageContent = (message: { text: string; sender: 'user' | 'ai' }) => {
    return <MessageContent message={message} />;
  };

  return (
    <div className="app">
      <ChatContainer 
        messages={messages}
        inputValue={inputValue}
        isLoading={isLoading}
        setInputValue={setInputValue}
        handleSubmit={handleSubmit}
        formatTime={formatTime}
        renderMessageContent={renderMessageContent}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
    </div>
  );
};

export default App;
