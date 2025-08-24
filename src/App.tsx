import React, { useState, useRef, useEffect } from 'react';
import ChatContainer from './ChatContainer';
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
      const response = await fetch('http://logan-linux.tailnet.internal:11434/api/generate', {
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
      // Check if this line starts a thoughts block (starts with "<think>")
      if (line.trim().startsWith('<think>') && !inThoughtsBlock) {
        inThoughtsBlock = true;
      } else if (inThoughtsBlock) {
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
      <ChatContainer 
        messages={messages}
        inputValue={inputValue}
        isLoading={isLoading}
        setInputValue={setInputValue}
        handleSubmit={handleSubmit}
        formatTime={formatTime}
        renderMessageContent={renderMessageContent}
      />
    </div>
  );
};

export default App;
