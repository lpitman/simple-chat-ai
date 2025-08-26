const express = require('express');
const cors = require('cors');
const { Ollama } = require('ollama'); // Import Ollama client
const chatRouter = require('./routes/chat'); // Import the chat router

const app = express();
const port = 3001;

// Initialize Ollama client with the specified host
const ollama = new Ollama({ host: 'http://logan-linux.tailnet.internal:11434' });

// Middleware
app.use(cors());
app.use(express.json());

// Mount the chat router
// All requests to /api/chat will be handled by chatRouter
app.use('/api/chat', chatRouter(ollama)); // Pass the ollama client to the router

// Start the server
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
