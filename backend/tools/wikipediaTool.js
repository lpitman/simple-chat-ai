const wiki = require('wikijs').default;

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
const wikipediaToolDefinition = {
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

module.exports = {
    search_wikipedia,
    wikipediaToolDefinition,
};
