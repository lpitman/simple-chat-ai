// src/types/chat.ts
export interface Message {
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
