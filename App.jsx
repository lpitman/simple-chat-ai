import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
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
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to process message text and wrap "<tool_call>" blocks in collapsible elements
  const processMessageText = (text) => {
    // Split the text by "<tool_call>" blocks
    const parts = text.split(/(\u2694+)/);
    
    return parts.map((part, index) => {
      // If this part is a "<tool_call>" block, wrap it in a collapsible element
      if (part === '<tool_call>') {
        return <span key={index} className="thoughts-block"><tool_call></span>;
      }
      
      // If this part contains thoughts content, wrap it appropriately
      if (part.includes('<tool_call>')) {
        const thoughtParts = part.split(/(\u2694+)/);
        return thoughtParts.map((thoughtPart, thoughtIndex) => {
          if (thoughtPart === '<tool_call>') {
            return <span key={thoughtIndex} className="thoughts-block"><tool_call></span>;
          }
          return <span key={thoughtIndex}>{thoughtPart}</span>;
        });
      }
      
      return <span key={index}>{part}</span>;
    });
  };

  // Function to render message content with collapsible thoughts
  const renderMessageContent = (message) => {
    if (!message.text) return null;
    
    // Simple approach: wrap any text that starts with "<tool_call>" in a collapsible div
    const lines = message.text.split('\n');
    const processedLines = [];
    
    let inThoughtsBlock = false;
    let thoughtsContent = [];
    
    lines.forEach((line, index) => {
      if (line.trim().startsWith('<tool_call>')) {
        if (!inThoughtsBlock) {
          // Start a new thoughts block
          inThoughtsBlock = true;
          thoughtsContent = [line];
        } else {
          // Continue the thoughts block
          thoughtsContent.push(line);
        }
      } else {
        if (inThoughtsBlock) {
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
        }
        processedLines.push(<div key={`line-${index}`}>{line}</div>);
      }
    });
    
    // Handle any remaining thoughts content
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
