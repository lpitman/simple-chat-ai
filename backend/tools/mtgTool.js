const axios = require('axios');

/**
 * Searches the Magic: The Gathering API for a card by name and returns its details and image.
 * @param {object} args - Arguments object containing the card name.
 * @param {string} args.card_name - The (roughly) correct name of the Magic: The Gathering card to search for.
 * @returns {Promise<string>} A promise that resolves to a string containing card details and an image, or an error message.
 */
async function search_mtg_card(args) {
    const { card_name } = args;
    console.log(`--- Executing tool: search_mtg_card for card_name: "${card_name}" ---`);

    try {
        // Use the /cards endpoint with the 'name' parameter for partial matching
        const response = await axios.get(`https://api.magicthegathering.io/v1/cards?name=${encodeURIComponent(card_name)}`);

        if (!response.data || !response.data.cards || response.data.cards.length === 0) {
            return `Error: Could not find a Magic: The Gathering card with the name "${card_name}". Please try a different name.`;
        }

        // Get the first card found (most relevant result)
        const card = response.data.cards[0];

        let output = `**${card.name}**\n`;
        if (card.manaCost) {
            output += `Mana Cost: ${card.manaCost}\n`;
        }
        output += `Type: ${card.type}\n`;
        output += `Rarity: ${card.rarity}\n`;
        if (card.power && card.toughness) {
            output += `Power/Toughness: ${card.power}/${card.toughness}\n`;
        }
        if (card.loyalty) {
            output += `Loyalty: ${card.loyalty}\n`;
        }
        if (card.text) {
            output += `Text: ${card.text}\n`;
        }
        if (card.flavor) {
            output += `Flavor Text: *${card.flavor}*\n`;
        }

        // Include the image URL if available
        if (card.imageUrl) {
            output += `\n![${card.name} Image](${card.imageUrl})\n`;
        } else {
            output += `\n(No image available for this card.)\n`;
        }

        return output;

    } catch (error) {
        console.error(`Error in search_mtg_card for "${card_name}":`, error.message);
        if (error.response) {
            return `Error fetching MTG card: ${error.response.status} - ${error.response.statusText}. Details: ${error.response.data ? JSON.stringify(error.response.data) : 'No further details.'}`;
        } else if (error.request) {
            return `Error fetching MTG card: No response received from MTG API. Is your internet connected?`;
        } else {
            return `Error fetching MTG card: ${error.message}`;
        }
    }
}

// Define the tool for Ollama in the required format
const mtgToolDefinition = {
    type: 'function',
    function: {
        name: 'search_mtg_card',
        description: 'Searches for a Magic: The Gathering card by name and returns its main details and an image.',
        parameters: {
            type: 'object',
            properties: {
                card_name: {
                    type: 'string',
                    description: 'The (roughly) correct name of the Magic: The Gathering card to search for (e.g., "Black Lotus", "Archangel Avacyn", "Jace").',
                },
            },
            required: ['card_name'],
        },
    },
};

module.exports = {
    search_mtg_card,
    mtgToolDefinition,
};
