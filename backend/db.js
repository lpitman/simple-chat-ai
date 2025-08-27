const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const DB_PATH = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                console.log('Users table checked/created.');
                // Check if initial user exists and create if not
                db.get("SELECT COUNT(*) AS count FROM users WHERE username = ?", [process.env.INITIAL_USERNAME], async (err, row) => {
                    if (err) {
                        console.error('Error checking initial user:', err.message);
                        return;
                    }
                    if (row.count === 0) {
                        const initialUsername = process.env.INITIAL_USERNAME;
                        const initialPassword = process.env.INITIAL_PASSWORD;
                        if (initialUsername && initialPassword) {
                            const hashedPassword = await bcrypt.hash(initialPassword, 10);
                            db.run("INSERT INTO users (username, password) VALUES (?, ?)", [initialUsername, hashedPassword], (err) => {
                                if (err) {
                                    console.error('Error inserting initial user:', err.message);
                                } else {
                                    console.log(`Initial user '${initialUsername}' created.`);
                                }
                            });
                        } else {
                            console.warn('INITIAL_USERNAME or INITIAL_PASSWORD not set in .env. Skipping initial user creation.');
                        }
                    } else {
                        console.log(`Initial user '${process.env.INITIAL_USERNAME}' already exists.`);
                    }
                });

                // Check if guest user exists and create if not (if enabled)
                if (process.env.GUEST_USERNAME && process.env.GUEST_PASSWORD) {
                    db.get("SELECT COUNT(*) AS count FROM users WHERE username = ?", [process.env.GUEST_USERNAME], async (err, row) => {
                        if (err) {
                            console.error('Error checking guest user:', err.message);
                            return;
                        }
                        if (row.count === 0) {
                            const guestUsername = process.env.GUEST_USERNAME;
                            const guestPassword = process.env.GUEST_PASSWORD;
                            const hashedPassword = await bcrypt.hash(guestPassword, 10);
                            db.run("INSERT INTO users (username, password) VALUES (?, ?)", [guestUsername, hashedPassword], (err) => {
                                if (err) {
                                    console.error('Error inserting guest user:', err.message);
                                } else {
                                    console.log(`Guest user '${guestUsername}' created.`);
                                }
                            });
                        } else {
                            console.log(`Guest user '${process.env.GUEST_USERNAME}' already exists.`);
                        }
                    });
                }
            }
        });
    }
});

module.exports = db;
