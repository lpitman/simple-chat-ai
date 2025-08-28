const db = require('../db'); // Import the database connection
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const GUEST_USERNAME = process.env.GUEST_USERNAME;
const GUEST_USER_RATE_LIMIT = parseInt(process.env.GUEST_USER_RATE_LIMIT || '10', 10); // Default to 10 requests
const GUEST_USER_RATE_LIMIT_WINDOW_MS = parseInt(process.env.GUEST_USER_RATE_LIMIT_WINDOW_MS || '3600000', 10); // Default to 1 hour (3600000 ms)

const rateLimit = (req, res, next) => {
    // If authentication is disabled, or if there's no user, or if it's not the guest user, skip rate limiting
    if (process.env.DISABLE_AUTH === 'true' || !req.user || req.user.username !== GUEST_USERNAME) {
        return next();
    }

    const userId = req.user.id;
    const currentTime = Date.now();
    const windowStart = currentTime - GUEST_USER_RATE_LIMIT_WINDOW_MS;

    db.get("SELECT COUNT(*) AS count FROM rate_limits WHERE user_id = ? AND timestamp > ?", [userId, windowStart], (err, row) => {
        if (err) {
            console.error('Error querying rate limits:', err.message);
            return res.status(500).json({ error: 'Internal server error during rate limit check.' });
        }

        const requestCount = row.count;

        if (requestCount >= GUEST_USER_RATE_LIMIT) {
            console.warn(`Guest user ${GUEST_USERNAME} (ID: ${userId}) exceeded rate limit.`);
            return res.status(429).json({ error: `Too many requests. You can make ${GUEST_USER_RATE_LIMIT} requests per hour.` });
        }

        // Record the current request
        db.run("INSERT INTO rate_limits (user_id, timestamp) VALUES (?, ?)", [userId, currentTime], function(insertErr) {
            if (insertErr) {
                console.error('Error inserting rate limit entry:', insertErr.message);
                return res.status(500).json({ error: 'Internal server error recording request.' });
            }
            // Optionally, clean up old entries to prevent the table from growing indefinitely
            db.run("DELETE FROM rate_limits WHERE timestamp < ?", [windowStart], (deleteErr) => {
                if (deleteErr) {
                    console.error('Error cleaning up old rate limit entries:', deleteErr.message);
                }
            });
            next();
        });
    });
};

module.exports = rateLimit;
