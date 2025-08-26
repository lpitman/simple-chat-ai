import React, { useRef, useEffect } from 'react';
import './ChatContainer.css';
import { themes } from './themes'; // Import themes to get theme names

// Update the Message interface to match the one in src/App.tsx
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  // Properties for Ollama API (role and content are always present for Ollama)
  role: 'user' | 'assistant' | 'tool';
  content: string;
  // Optional properties for Ollama's tool calls (though backend handles execution)
  tool_calls?: Array<{ id: string; function: { name: string; arguments: any } }>;
  tool_call_id?: string;
}

const ChatContainer: React.FC<{
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  setInputValue: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  formatTime: (date: Date) => string;
  renderMessageContent: (message: Message) => React.ReactNode;
  currentThemeName: string; // Changed from darkMode
  setTheme: (themeName: string) => void; // New prop for setting theme
}> = ({ 
  messages, 
  inputValue, 
  isLoading, 
  setInputValue, 
  handleSubmit, 
  formatTime, 
  renderMessageContent,
  currentThemeName, // Use currentThemeName
  setTheme // Use setTheme
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>AI Chat</h1>
        <p>Powered by Ollama Qwen3</p>
        <div className="theme-selector-container">
          <label htmlFor="theme-select" className="visually-hidden">Select Theme:</label>
          <select id="theme-select" onChange={handleThemeChange} value={currentThemeName}>
            {Object.keys(themes).map((themeName) => (
              <option key={themeName} value={themeName}>
                {themeName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <p>Welcome! Ask me anything and I'll do my best to help.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender}`}
            >
              <div className="message-content">
                <div className="message-text">
                  {renderMessageContent(message)}
                </div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message ai typing">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message here..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputValue.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatContainer;
