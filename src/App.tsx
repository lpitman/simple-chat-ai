import React, { useState, useRef, useEffect } from 'react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

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
      // Send request to Ollama service
      const response = await fetch('http://localhost:11434/api/generate', {
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

  // Function to render message content with collapsible thoughts
  const renderMessageContent = (message: { text: string }) => {
    if (!message.text) return null;
    
    // Split the text by lines
    const lines = message.text.split('\n');
    const processedLines = [];
    
    let inThoughtsBlock = false;
    let thoughtsContent = [];
    
    lines.forEach((line, index) => {
      // Check if this line starts a thoughts block (starts with "<tool_call>")
      if (line.trim().startsWith('<think>') && !inThoughtsBlock) {
        inThoughtsBlock
        // We're starting a new thoughts block
        inThoughtsBlock = true;
        return;
      } 
      
      if (inThoughtsBlock) {
        if (line.trim().endsWith('</think>')) {
          // End the thoughts block and create collapsible element
          processedLines.push(
            <div key={`thoughts-${index}`} className="collapsible-thoughts">
              <details>
                <summary>Thoughts</summary>
                <div className="thoughts-content">
                  {thoughtsContent.join('\n')}
                </div>
              </details>
            </div>
          );
          inThoughtsBlock = false;
          thoughtsContent = [];
          return;
        } else {
          thoughtsContent.push(line);
        }
      } else {
        // Add the regular line
        processedLines.push(<div key={`line-${index}`}>{line}</div>);
      }
    });
    
    // Handle any remaining thoughts content at the end
    if (inThoughtsBlock && thoughtsContent.length > 0) {
      processedLines.push(
        <div key="final-thoughts" className="collapsible-thoughts">
          <details>
            <summary>Thoughts</summary>
            <div className="thoughts-content">
              {thoughtsContent.join('\n')}
            </div>
          </details>
        </div>
      );
    }
    
    return processedLines;
  };

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <h1>AI Chat</h1>
          <p>Powered by Ollama Qwen3</p>
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
                    {message.sender === 'ai' ? renderMessageContent(message) : message.text}
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
    </div>
  );
};

export default App;
