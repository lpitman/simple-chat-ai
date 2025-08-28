// src/hooks/useChat.ts
import { useState } from 'react';
import type { Message } from '../types/chat';

interface UseChatProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  disableAuth: boolean;
}

export const useChat = ({ isAuthenticated, setIsAuthenticated, disableAuth }: UseChatProps) => {
  // Initialize inputValue from localStorage, then clear localStorage
  const [inputValue, setInputValue] = useState<string>(() => {
    const savedPrompt = localStorage.getItem('savedPrompt');
    if (savedPrompt) {
      localStorage.removeItem('savedPrompt'); // Clear it immediately after reading
      return savedPrompt;
    }
    return '';
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentPrompt = inputValue.trim(); // Capture current value before potential clearing
    if (!currentPrompt || isLoading) return;

    let token: string | null = null;
    if (!disableAuth && isAuthenticated) {
      token = localStorage.getItem('jwtToken');
      if (!token) {
        console.error('No authentication token found. Please log in.');
        // Save the prompt before forcing re-login
        localStorage.setItem('savedPrompt', currentPrompt);
        setIsAuthenticated(false); // Force re-login
        return;
      }
    }

    // Determine the backend base URL dynamically
    let backendBaseUrl: string;
    if (import.meta.env.DEV) {
      // In development, use the environment variable VITE_BACKEND_URL_DEV,
      // falling back to localhost if not set.
      backendBaseUrl = import.meta.env.VITE_BACKEND_URL_DEV || 'http://localhost:3001';
    } else {
      // In production, assume the API is proxied under /api on the same host and port.
      // An empty string means a relative path, e.g., /api/chat
      backendBaseUrl = '';
    }

    // Prepare the user message for display and for sending to Ollama
    const newUserMessage: Message = {
      id: Date.now(),
      text: currentPrompt, // Use currentPrompt
      sender: 'user',
      timestamp: new Date(),
      role: 'user', // Ollama role
      content: currentPrompt, // Ollama content
    };

    // Update messages state with the new user message immediately
    setMessages(prev => [...prev, newUserMessage]);
    // DO NOT CLEAR inputValue HERE YET. Clear it only on successful send or specific error.
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

      if (!disableAuth && (response.status === 401 || response.status === 403)) {
        // Token expired or invalid, force re-login (only if auth is enabled)
        localStorage.removeItem('jwtToken');
        // Save the prompt before forcing re-login
        localStorage.setItem('savedPrompt', currentPrompt);
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
      setInputValue(''); // Clear input only on successful response
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}. Please try again later.`,
        sender: 'ai',
        timestamp: new Date(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}. Please try again later.`,
      };
      setMessages(prev => [...prev, errorMessage]);
      // Do not clear inputValue if there was an error, so user can retry or edit
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    // Do NOT clear inputValue here. It should be handled by the useState initializer or handleSubmit.
  };

  return {
    messages,
    inputValue,
    isLoading,
    setInputValue,
    handleSubmit,
    clearMessages,
  };
};
