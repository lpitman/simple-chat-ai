import React, { useState, useEffect } from 'react';
import ChatContainer from './ChatContainer';
import MessageContent from './MessageContent';
import './App.css';

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

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]); // Use the new Message type
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


      // Send request to the new backend endpoint /api/chat
      const response = await fetch(`${backendBaseUrl}/api/chat`, { // Changed URL to /api/chat
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messagesForOllama, // Send the full message history
          // model and stream are now handled by the backend
        })
      });

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Create a proper render function that doesn't use hooks directly
  const renderMessageContent = (message: Message) => {
    // MessageContent expects { text: string }, so we pass the 'text' property
    return <MessageContent message={{ text: message.text }} />;
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
