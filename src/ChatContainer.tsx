import React, { useRef, useEffect, useState } from 'react';
import './ChatContainer.css';
import { themes } from './themes'; // Import themes to get theme names
import SettingsModal from './SettingsModal'; // Import the new SettingsModal

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
  currentThemeName: string;
  setTheme: (themeName: string) => void;
}> = ({ 
  messages, 
  inputValue, 
  isLoading, 
  setInputValue, 
  handleSubmit, 
  formatTime, 
  renderMessageContent,
  currentThemeName,
  setTheme
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // State for modal visibility

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
        <button className="settings-button" onClick={() => setIsSettingsModalOpen(true)}>
          {/* Gear icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-settings">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82-.33H9A1.65 1.65 0 0 0 10 3v-.09a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 .33 1.82V9h.09A1.65 1.65 0 0 0 21 10c.59 0 1.16.23 1.51.68A1.65 1.65 0 0 0 22.91 12v.09a1.65 1.65 0 0 0-.33 1.82l-.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33z"></path>
          </svg>
        </button>
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

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentThemeName={currentThemeName}
        setTheme={setTheme}
      />
    </div>
  );
};

export default ChatContainer;
