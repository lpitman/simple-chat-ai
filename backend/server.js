const express = require('express');
const cors = require('cors');
const { Ollama } = require('ollama'); // Import Ollama client
const chatRouter = require('./routes/chat'); // Import the chat router
const authRouter = require('./routes/auth'); // Import the new auth router
const authenticateToken = require('./middleware/auth'); // Import the new auth middleware
const db = require('./db'); // Import the database connection (to ensure it initializes)
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = 3001;

// Initialize Ollama client with the specified host
const ollama = new Ollama({ host: 'http://logan-linux.tailnet.internal:11434' });

// Middleware
app.use(cors());
app.use(express.json());

// Mount the authentication router
app.use('/api/auth', authRouter);

// Mount the chat router, protected by authentication middleware
// All requests to /api/chat will be handled by chatRouter, but only after token verification
app.use('/api/chat', authenticateToken, chatRouter(ollama)); // Pass the ollama client to the router

// Start the server
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
