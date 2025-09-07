const express = require('express');
const cors = require('cors');
const { Ollama } = require('ollama'); 
const chatRouter = require('./routes/chat'); 
const authRouter = require('./routes/auth'); 
const authenticateToken = require('./middleware/auth'); 
const rateLimit = require('./middleware/rateLimit');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = 3001;

// Determine if authentication is disabled
const DISABLE_AUTH = process.env.DISABLE_AUTH === 'true';
if (DISABLE_AUTH) {
    console.warn('Authentication is DISABLED via environment variable. All chat API calls will bypass authentication.');
}

// Initialize Ollama client with the specified host
const ollama = new Ollama({ host: 'http://logan-linux.tailnet.internal:11434' });

// Middleware
app.use(cors());
app.use(express.json());

// Mount the authentication router (always available for login/registration)
app.use('/api/auth', authRouter);

// Mount the chat router
// Conditionally apply the authentication and rate limiting middleware
if (DISABLE_AUTH) {
    app.use('/api/chat', chatRouter(ollama)); 
} else {
    // Apply authentication first, then rate limiting, then the chat router
    app.use('/api/chat', authenticateToken, rateLimit, chatRouter(ollama));
}


// Start the server
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
