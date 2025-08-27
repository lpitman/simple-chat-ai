const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db'); // Import the database connection
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables. Authentication routes will not work.');
    // In a production environment, you might want to exit here.
    // For development, we'll allow it to proceed but log a warning.
    // process.exit(1); 
}

const router = express.Router();

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) {
            console.error('Database error during login:', err.message);
            return res.status(500).json({ error: 'Internal server error.' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // User authenticated, generate JWT
        if (!JWT_SECRET) {
            return res.status(500).json({ error: 'Server misconfiguration: JWT secret not set.' });
        }
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
        res.json({ token });
    });
});

module.exports = router;
