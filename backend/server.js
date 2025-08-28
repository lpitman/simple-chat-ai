const express = require('express');
const cors = require('cors');
const { Ollama } = require('ollama'); // Import Ollama client
const chatRouter = require('./routes/chat'); // Import the chat router
const authRouter = require('./routes/auth'); // Import the new auth router
const authenticateToken = require('./middleware/auth'); // Import the new auth middleware
const rateLimit = require('./middleware/rateLimit'); // Import the new rate limit middleware
const db = require('./db'); // Import the database connection (to ensure it initializes)
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
    app.use('/api/chat', chatRouter(ollama)); // No authentication or rate limiting middleware
} else {
    // Apply authentication first, then rate limiting, then the chat router
    app.use('/api/chat', authenticateToken, rateLimit, chatRouter(ollama));
}


// Start the server
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
