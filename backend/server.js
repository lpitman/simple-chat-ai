const express = require('express');
const cors = require('cors');
const { Ollama } = require('ollama'); // Import Ollama client for custom host
const wiki = require('wikijs').default; // Import wikijs

const app = express();
const port = 3001;

// Initialize Ollama client with the specified host
const ollama = new Ollama({ host: 'http://logan-linux.tailnet.internal:11434' });

// Middleware
app.use(cors());
app.use(express.json());

// --- Tool Function and Definition ---
/**
 * Searches Wikipedia for a given query and returns a summary of the article.
 * @param {object} args - Arguments object containing the query.
 * @param {string} args.query - The search term for Wikipedia.
 * @returns {Promise<string>} A promise that resolves to the summary text or an error message.
 */
async function search_wikipedia(args) {
    console.log(`--- Executing tool: search_wikipedia for query: "${args.query}" ---`);
    try {
        const page = await wiki().page(args.query);
        const summary = await page.summary();
        // Limit summary length to avoid overwhelming the LLM context, as per your example
        return summary.slice(0, 400) + (summary.length > 400 ? '...' : '');
    } catch (error) {
        console.error(`Error in search_wikipedia for "${args.query}":`, error.message);
        return `Error: Could not find a Wikipedia article for "${args.query}".`;
    }
}

// Define the tool for Ollama in the required format
const wikipediaTool = {
    type: 'function',
    function: {
        name: 'search_wikipedia',
        description: 'Searches Wikipedia for a given query and returns a summary of the article.',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The search term for Wikipedia.',
                },
            },
            required: ['query'],
        },
    },
};

// Map tool names to their corresponding functions
const availableFunctions = {
    search_wikipedia: search_wikipedia,
};
// --- End Tool Function and Definition ---


// API endpoint for chat logic, now handling Ollama tool calls
app.post('/api/chat', async (req, res) => {
  try {
    // Frontend will now send an array of messages
    const { messages } = req.body;
    const model = 'qwen3'; // Using qwen3 as per previous setup

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // 1. Initial call to Ollama with the current message history and available tools
    const response = await ollama.chat({
        model: model,
        messages: messages,
        tools: [wikipediaTool], // Provide the tools to Ollama
    });

    const responseMessage = response.message;

    // 2. Check if Ollama requested a tool call
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        console.log("Ollama requested tool calls:", responseMessage.tool_calls);

        // Prepare messages to send back to Ollama, including the tool call request
        // The tool call message itself needs to be added to the history for Ollama
        const messagesWithToolCall = [...messages, responseMessage];

        // Execute each tool call requested by Ollama
        for (const toolCall of responseMessage.tool_calls) {
            const functionName = toolCall.function.name;
            const functionArgs = toolCall.function.arguments;

            if (availableFunctions[functionName]) {
                const toolOutput = await availableFunctions[functionName](functionArgs);
                console.log(`Tool "${functionName}" output:`, toolOutput);

                // Add the tool's output back to the message history
                messagesWithToolCall.push({
                    role: 'tool',
                    content: toolOutput,
                    tool_call_id: toolCall.id, // Important for Ollama to link output to call
                });
            } else {
                console.warn(`Function "${functionName}" not found in availableFunctions.`);
                messagesWithToolCall.push({
                    role: 'tool',
                    content: `Error: Function "${functionName}" not found.`,
                    tool_call_id: toolCall.id,
                });
            }
        }

        // 3. Send the updated message history (including tool calls and their results) back to Ollama
        // This allows Ollama to generate a final, human-readable response based on the tool output.
        const finalResponse = await ollama.chat({
            model: model,
            messages: messagesWithToolCall,
        });

        return res.json(finalResponse.message); // Return Ollama's final message
    }

    // If no tool call was requested, just return Ollama's initial response
    return res.json(responseMessage);

  } catch (error) {
    console.error('Error in /api/chat endpoint:', error);
    // Provide more specific error messages if possible
    if (error.name === 'FetchError') {
        return res.status(503).json({ error: `Could not connect to Ollama at ${ollama.host}. Is it running? Check your Ollama server logs.` });
    }
    res.status(500).json({ error: 'Internal server error while processing AI request.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
