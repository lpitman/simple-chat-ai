import React, { useState, useEffect } from 'react';
import ChatContainer from './ChatContainer';
import MessageContent from './MessageContent';
import LoginModal from './LoginModal'; // Import the new LoginModal
import './App.css';
import { themes } from './themes'; // Only import the runtime value 'themes'

// Define ThemeColors type based on the structure of a theme in the 'themes' object
// This ensures type safety without needing to import the interface directly at runtime.
type ThemeColors = typeof themes['light'];

// Define the Message type to include both UI display properties and Ollama API properties
interface Message {
  id: number; // Unique ID for React keys (for UI rendering)
  text: string; // The text content to display in the UI
  sender: 'user' | 'ai'; // For UI styling (user/ai bubble)
  timestamp: Date; // For UI display

  // Properties for Ollama API (role and content are always present for Ollama)
  role: 'user' | 'assistant' | 'tool';
  content: string;
  // Optional properties for Ollama's tool calls (though backend handles execution)
  tool_calls?: Array<{ id: string; function: { name: string; arguments: any } }>;
  tool_call_id?: string;
}

// Determine if authentication is disabled via environment variable
const DISABLE_AUTH = import.meta.env.VITE_DISABLE_AUTH === 'true';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]); // Use the new Message type
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // If auth is disabled, always consider authenticated. Otherwise, check for token.
    return DISABLE_AUTH || !!localStorage.getItem('jwtToken');
  });
  const [currentThemeName, setCurrentThemeName] = useState<string>(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    // Default to 'light' if no theme is saved or if the saved theme is not found
    return savedTheme && themes[savedTheme] ? savedTheme : 'light';
  });

  // Apply theme CSS variables to the body
  useEffect(() => {
    const selectedThemeColors: ThemeColors = themes[currentThemeName];
    if (selectedThemeColors) {
      for (const [property, value] of Object.entries(selectedThemeColors)) {
        document.body.style.setProperty(property, value);
      }
    }
    localStorage.setItem('selectedTheme', currentThemeName);
  }, [currentThemeName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    let token: string | null = null;
    if (!DISABLE_AUTH) {
      token = localStorage.getItem('jwtToken');
      if (!token) {
        console.error('No authentication token found. Please log in.');
        setIsAuthenticated(false); // Force re-login
        return;
      }
    }

    // Determine the backend base URL dynamically
    let backendBaseUrl: string;
    if (import.meta.env.DEV) {
      // In development, use localhost:3001 as the backend runs on a different port
      backendBaseUrl = 'http://localhost:3001';
    } else {
      // In production, assume the API is proxied under /api on the same host and port.
      // An empty string means a relative path, e.g., /api/chat
      backendBaseUrl = ''; 
    }

    // Prepare the user message for display and for sending to Ollama
    const newUserMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      role: 'user', // Ollama role
      content: inputValue, // Ollama content
    };

    // Update messages state with the new user message immediately
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Construct the messages array to send to the backend for Ollama.
      // Only include the properties Ollama expects: role, content, tool_calls, tool_call_id.
      const messagesForOllama = messages.map(msg => {
        const ollamaMsg: { role: string; content: string; tool_calls?: any[]; tool_call_id?: string } = {
          role: msg.role,
          content: msg.content,
        };
        if (msg.tool_calls) ollamaMsg.tool_calls = msg.tool_calls;
        if (msg.tool_call_id) ollamaMsg.tool_call_id = msg.tool_call_id;
        return ollamaMsg;
      });
      // Add the current user message to the history for Ollama
      messagesForOllama.push({ role: newUserMessage.role, content: newUserMessage.content });

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) { // Only add Authorization header if token exists (i.e., auth is enabled)
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Send request to the new backend endpoint /api/chat
      const response = await fetch(`${backendBaseUrl}/api/chat`, { // Changed URL to /api/chat
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          messages: messagesForOllama, // Send the full message history
          // model and stream are now handled by the backend
        })
      });

      if (!DISABLE_AUTH && (response.status === 401 || response.status === 403)) {
        // Token expired or invalid, force re-login (only if auth is enabled)
        localStorage.removeItem('jwtToken');
        setIsAuthenticated(false);
        console.error('Authentication failed. Please log in again.');
        return; // Stop further processing
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json(); // This `data` is the Ollama message object (e.g., { role: 'assistant', content: '...' })

      // Add AI message (or tool call message if the backend were to pass it through)
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: data.content || '', // Ollama response has 'content'
        sender: 'ai',
        timestamp: new Date(),
        role: data.role,
        content: data.content || '',
        tool_calls: data.tool_calls, // Capture tool calls if any (though backend handles execution)
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}. Please try again.`,
        sender: 'ai',
        timestamp: new Date(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}. Please try again.`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const setTheme = (themeName: string) => {
    setCurrentThemeName(themeName);
  };

  const handleLoginSuccess = () => {
    if (!DISABLE_AUTH) { // Only set isAuthenticated if auth is enabled
      setIsAuthenticated(true);
    }
    setMessages([]); // Clear messages on successful login
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    if (!DISABLE_AUTH) { // Only set isAuthenticated if auth is enabled
      setIsAuthenticated(false);
    }
    setMessages([]); // Clear messages on logout
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
