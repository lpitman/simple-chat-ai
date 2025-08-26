const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // For making HTTP requests

const app = express();
const port = 3001; // Or any other suitable port

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // To parse JSON request bodies

// API endpoint to proxy requests to the AI service
app.post('/api/generate', async (req, res) => {
  try {
    const { model, prompt, stream } = req.body;

    if (!model || !prompt) {
      return res.status(400).json({ error: 'Model and prompt are required.' });
    }

    const aiServiceUrl = 'https://ai-chat.haverman.duckdns.org/api/generate';

    const response = await fetch(aiServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, prompt, stream }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from AI service: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ error: `AI service error: ${errorText}` });
    }

    const data = await response.json();
    res.json(data); // Send the AI service response back to the client
  } catch (error) {
    console.error('Error proxying request to AI service:', error);
    res.status(500).json({ error: 'Internal server error while processing AI request.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
