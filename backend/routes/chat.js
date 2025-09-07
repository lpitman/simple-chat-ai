const express = require('express');
const { search_wikipedia, wikipediaToolDefinition } = require('../tools/wikipediaTool');
const { get_current_weather, weatherToolDefinition } = require('../tools/weatherTool');
const { search_mtg_card, mtgToolDefinition } = require('../tools/mtgTool'); 

// Map tool names to their corresponding functions
const availableFunctions = {
    search_wikipedia: search_wikipedia,
    get_current_weather: get_current_weather,
    search_mtg_card: search_mtg_card, 
};

// Export a function that takes the ollama client as an argument
module.exports = (ollamaClient) => {
    const router = express.Router();
    const model = 'qwen3'; // Define model here or pass it as well if it needs to be dynamic

    router.post('/', async (req, res) => { // Endpoint is just '/' because it will be mounted at '/api/chat'
        try {
            const { messages } = req.body;

            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                return res.status(400).json({ error: 'Messages array is required.' });
            }

            // 1. Initial call to Ollama with the current message history and available tools
            const response = await ollamaClient.chat({ 
                model: model,
                messages: messages,
                tools: [wikipediaToolDefinition, weatherToolDefinition, mtgToolDefinition], 
            });

            const responseMessage = response.message;

            // 2. Check if Ollama requested a tool call
            if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                console.log("Ollama requested tool calls:", responseMessage.tool_calls);

                // Prepare messages to send back to Ollama, including the tool call request
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
                const finalResponse = await ollamaClient.chat({
                    model: model,
                    messages: messagesWithToolCall,
                });

                return res.json(finalResponse.message); 
            }

            // If no tool call was requested, just return Ollama's initial response
            return res.json(responseMessage);

        } catch (error) {
            console.error('Error in /api/chat endpoint:', error);
            // Provide more specific error messages if possible
            if (error.name === 'FetchError') {
                // Access ollamaClient.host to provide a more informative error message
                return res.status(503).json({ error: `Could not connect to Ollama at ${ollamaClient.host}. Is it running? Check your Ollama server logs.` });
            }
            res.status(500).json({ error: 'Internal server error while processing AI request.' });
        }
    });

    return router;
};
