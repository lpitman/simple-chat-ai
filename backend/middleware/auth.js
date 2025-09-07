const jwt = require('jsonwebtoken');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.warn('JWT_SECRET is not defined in environment variables. JWT authentication will not work. This might be intentional if DISABLE_AUTH is true.');
    // Do not exit here, as DISABLE_AUTH might be true.
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ error: 'Authentication token required.' });
    }

    if (!JWT_SECRET) {
        return res.status(500).json({ error: 'Server misconfiguration: JWT secret not set.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification failed:', err.message);
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
