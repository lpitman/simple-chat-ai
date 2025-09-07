const axios = require('axios');

/**
 * Helper function for WMO Weather interpretation codes (simplified)
 * Full list: https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-21-02/WMO%20Ext.%208%20Common%20Code%20Table%20A.pdf
 * Open-Meteo specific: https://open-meteo.com/en/docs
 */
function getWeatherDescription(code) {
    switch (code) {
        case 0: return 'Clear sky';
        case 1: return 'Mainly clear';
        case 2: return 'Partly cloudy';
        case 3: return 'Overcast';
        case 45: return 'Fog';
        case 48: return 'Depositing rime fog';
        case 51: return 'Drizzle: Light';
        case 53: return 'Drizzle: Moderate';
        case 55: return 'Drizzle: Dense';
        case 56: return 'Freezing Drizzle: Light';
        case 57: return 'Freezing Drizzle: Dense';
        case 61: return 'Rain: Light';
        case 63: return 'Rain: Moderate';
        case 65: return 'Rain: Heavy';
        case 66: return 'Freezing Rain: Light';
        case 67: return 'Freezing Rain: Heavy';
        case 71: return 'Snow fall: Light';
        case 73: return 'Snow fall: Moderate';
        case 75: return 'Snow fall: Heavy';
        case 77: return 'Snow grains';
        case 80: return 'Rain showers: Light';
        case 81: return 'Rain showers: Moderate';
        case 82: return 'Rain showers: Violent';
        case 85: return 'Snow showers: Light';
        case 86: return 'Snow showers: Heavy';
        case 95: return 'Thunderstorm: Slight or moderate';
        case 96: return 'Thunderstorm with slight hail';
        case 99: return 'Thunderstorm with heavy hail';
        default: return 'Unknown weather condition';
    }
}

/**
 * Helper function for wind direction in degrees to cardinal direction.
 */
function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

/**
 * Fetches current weather conditions for a given location using Open-Meteo API.
 * First, it uses Open-Meteo Geocoding API to get coordinates for the location.
 * @param {object} args - Arguments object containing location, optional country, and optional unit.
 * @param {string} args.location - The city or location for which to get the weather.
 * @param {string} [args.country] - Optional: The country to help disambiguate the location.
 * @param {'celsius' | 'fahrenheit'} [args.unit='celsius'] - The unit for temperature (celsius or fahrenheit).
 * @returns {Promise<string>} A promise that resolves to a string describing the weather.
 */
async function get_current_weather(args) {
    const { location, country, unit = 'celsius' } = args;
    console.log(`--- Executing tool: get_current_weather for location: "${location}", country: "${country || 'N/A'}", unit: "${unit}" ---`);

    try {
        // 1. Geocoding to get coordinates
        let geocodingQuery = location;
        if (country) {
            geocodingQuery += `, ${country}`;
        }
        const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(geocodingQuery)}&count=1&language=en&format=json`);

        if (!geoResponse.data || !geoResponse.data.results || geoResponse.data.results.length === 0) {
            return `Error: Could not find coordinates for "${location}${country ? ', ' + country : ''}". Please specify a more precise location.`;
        }

        const { latitude, longitude, name, country: foundCountry, admin1, admin2 } = geoResponse.data.results[0];
        const fullLocationName = `${name}${admin1 ? `, ${admin1}` : ''}${admin2 ? `, ${admin2}` : ''}, ${foundCountry}`;

        // 2. Fetch weather data from Open-Meteo Forecast API
        const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code&temperature_unit=${unit === 'fahrenheit' ? 'fahrenheit' : 'celsius'}`;
        const weatherResponse = await axios.get(weatherApiUrl);

        if (!weatherResponse.data || !weatherResponse.data.current) {
            return `Error: Could not retrieve weather data for ${fullLocationName}.`;
        }

        const current = weatherResponse.data.current;
        const temperature = current.temperature_2m;
        const apparentTemperature = current.apparent_temperature;
        const humidity = current.relative_humidity_2m;
        const precipitation = current.precipitation;
        const windSpeed = current.wind_speed_10m;
        const windDirection = current.wind_direction_10m;
        const weatherCode = current.weather_code;

        const weatherDescription = getWeatherDescription(weatherCode);
        const tempUnit = weatherResponse.data.current_units.temperature_2m;
        const windSpeedUnit = weatherResponse.data.current_units.wind_speed_10m;

        let output = `Current weather in ${fullLocationName}: `;
        output += `${weatherDescription}. `;
        output += `Temperature: ${temperature}${tempUnit} (feels like ${apparentTemperature}${tempUnit}). `;
        output += `Humidity: ${humidity}%. `;
        if (precipitation > 0) {
            output += `Precipitation: ${precipitation}${weatherResponse.data.current_units.precipitation}. `;
        }
        output += `Wind: ${windSpeed}${windSpeedUnit} from ${windDirection}° (${getWindDirection(windDirection)}).`;

        return output;

    } catch (error) {
        console.error(`Error in get_current_weather for "${location}${country ? ', ' + country : ''}":`, error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return `Error fetching weather: ${error.response.status} - ${error.response.statusText}. Details: ${error.response.data ? JSON.stringify(error.response.data) : 'No further details.'}`;
        } else if (error.request) {
            // The request was made but no response was received
            return `Error fetching weather: No response received from weather service. Is your internet connected?`;
        } else {
            // Something happened in setting up the request that triggered an Error
            return `Error fetching weather: ${error.message}`;
        }
    }
}

const weatherToolDefinition = {
    type: 'function',
    function: {
        name: 'get_current_weather',
        description: 'Gets the current weather conditions for a specified location, optionally narrowed down by country.',
        parameters: {
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'The city or location for which to get the weather (e.g., "London", "New York City").',
                },
                country: {
                    type: 'string',
                    description: 'Optional: The country to help disambiguate the location (e.g., "Canada", "UK").',
                },
                unit: {
                    type: 'string',
                    enum: ['celsius', 'fahrenheit'],
                    description: 'Optional: The unit for temperature (celsius or fahrenheit). Defaults to celsius.',
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
