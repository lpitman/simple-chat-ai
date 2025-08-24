import React, { useState, useRef, useEffect } from 'react';
import './ChatContainer.css';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatContainer: React.FC<{
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  setInputValue: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  formatTime: (date: Date) => string;
  renderMessageContent: (message: Message) => JSX.Element | null;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}> = ({ 
  messages, 
  inputValue, 
  isLoading, 
  setInputValue, 
  handleSubmit, 
  formatTime, 
  renderMessageContent,
  darkMode,
  toggleDarkMode
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>AI Chat</h1>
        <p>Powered by Ollama Qwen3</p>
        {toggleDarkMode && (
          <button 
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        )}
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
                  {message.sender === 'ai' ? (
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  ) : (
                    message.text
                  )}
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
