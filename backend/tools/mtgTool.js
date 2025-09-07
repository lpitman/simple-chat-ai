const axios = require('axios');

/**
 * Searches the Scryfall API for a Magic: The Gathering card by name and returns its details, image, and price.
 * @param {object} args - Arguments object containing the card name.
 * @param {string} args.card_name - The (roughly) correct name of the Magic: The Gathering card to search for.
 * @returns {Promise<string>} A promise that resolves to a string containing card details, image, and price, or an error message.
 */
async function search_mtg_card(args) {
    const { card_name } = args;
    console.log(`--- Executing tool: search_mtg_card for card_name: "${card_name}" using Scryfall API ---`);

    try {
        // Use Scryfall's fuzzy search for robust card name matching
        // This endpoint is good for finding a card by a (possibly partial) name.
        const response = await axios.get(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(card_name)}`);

        if (!response.data) {
            return `Error: Could not find a Magic: The Gathering card with the name "${card_name}" on Scryfall. Please try a different name.`;
        }

        const card = response.data;

        let output = `**${card.name}**\n`;
        if (card.mana_cost) {
            output += `Mana Cost: ${card.mana_cost}\n`;
        }
        output += `Type: ${card.type_line}\n`;
        output += `Rarity: ${card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}\n`; 
        if (card.power && card.toughness) {
            output += `Power/Toughness: ${card.power}/${card.toughness}\n`;
        }
        if (card.loyalty) {
            output += `Loyalty: ${card.loyalty}\n`;
        }
        if (card.oracle_text) {
            output += `Text: ${card.oracle_text}\n`;
        }
        if (card.flavor_text) {
            output += `Flavor Text: *${card.flavor_text}*\n`;
        }

        // Add price information from Scryfall (typically sourced from TCGPlayer for USD)
        if (card.prices) {
            if (card.prices.usd) {
                output += `\nPrice (USD, TCGPlayer): $${card.prices.usd}\n`;
            }
            if (card.prices.usd_foil) {
                output += `Price (USD Foil, TCGPlayer): $${card.prices.usd_foil}\n`;
            }
            
        }

        // Include the image URL if available (using 'normal' size)
        if (card.image_uris && card.image_uris.normal) {
            output += `\n![${card.name} Image](${card.image_uris.normal})\n`;
        } else {
            output += `\n(No image available for this card.)\n`;
        }

        return output;

    } catch (error) {
        console.error(`Error in search_mtg_card for "${card_name}":`, error.message);
        if (error.response) {
            if (error.response.status === 404) {
                return `Error: Could not find a Magic: The Gathering card with the name "${card_name}". Please check the spelling and try again.`;
            }
            return `Error fetching MTG card from Scryfall: ${error.response.status} - ${error.response.statusText}. Details: ${error.response.data ? JSON.stringify(error.response.data) : 'No further details.'}`;
        } else if (error.request) {
            return `Error fetching MTG card from Scryfall: No response received. Is your internet connected?`;
        } else {
            return `Error fetching MTG card from Scryfall: ${error.message}`;
        }
    }
}

// Define the tool for Ollama in the required format
const mtgToolDefinition = {
    type: 'function',
    function: {
        name: 'search_mtg_card',
        description: 'Searches for a Magic: The Gathering card by name and returns its main details, an image, and its current market price (USD, from TCGPlayer).',
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
