/**
 * Simulates fetching current weather conditions for a given location.
 * In a real application, this would call an external weather API.
 * @param {object} args - Arguments object containing location and unit.
 * @param {string} args.location - The city or location for which to get the weather.
 * @param {'celsius' | 'fahrenheit'} [args.unit='celsius'] - The unit for temperature (celsius or fahrenheit).
 * @returns {Promise<string>} A promise that resolves to a string describing the weather.
 */
async function get_current_weather(args) {
    const { location, unit = 'celsius' } = args;
    console.log(`--- Executing tool: get_current_weather for location: "${location}", unit: "${unit}" ---`);

    // Simulate different weather conditions based on location
    let weatherDescription;
    let temperature;

    switch (location.toLowerCase()) {
        case 'london':
            weatherDescription = 'cloudy with a chance of rain';
            temperature = unit === 'fahrenheit' ? 50 : 10; // 10°C / 50°F
            break;
        case 'new york':
            weatherDescription = 'sunny and clear';
            temperature = unit === 'fahrenheit' ? 75 : 24; // 24°C / 75°F
            break;
        case 'tokyo':
            weatherDescription = 'light breeze';
            temperature = unit === 'fahrenheit' ? 68 : 20; // 20°C / 68°F
            break;
        case 'sydney':
            weatherDescription = 'warm and humid';
            temperature = unit === 'fahrenheit' ? 82 : 28; // 28°C / 82°F
            break;
        default:
            weatherDescription = 'partly cloudy';
            temperature = unit === 'fahrenheit' ? 60 : 15; // 15°C / 60°F
            break;
    }

    return `The current weather in ${location} is ${weatherDescription} with a temperature of ${temperature}°${unit === 'fahrenheit' ? 'F' : 'C'}.`;
}

// Define the tool for Ollama in the required format
const weatherToolDefinition = {
    type: 'function',
    function: {
        name: 'get_current_weather',
        description: 'Gets the current weather conditions for a specified location.',
        parameters: {
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'The city and state, e.g. San Francisco, CA',
                },
                unit: {
                    type: 'string',
                    enum: ['celsius', 'fahrenheit'],
                    description: 'The unit for temperature.',
                },
            },
            required: ['location'],
        },
    },
};

module.exports = {
    get_current_weather,
    weatherToolDefinition,
};
