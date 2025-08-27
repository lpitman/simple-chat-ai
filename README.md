# Simple Chat AI: A Local AI Experimentation Platform

## Project Overview

This project provides a simple, full-stack web application designed for experimenting with and interacting with locally hosted Large Language Models (LLMs) via [Ollama](https://ollama.com/). It serves as a practical sandbox for developers and AI enthusiasts to explore local AI inference, integrate custom tool-calling functionalities, and understand the deployment of such a system in a production-like environment.

The primary motivation behind this project is to offer a hands-on way to:
*   **Run AI Locally**: Leverage the power of local LLMs without relying on cloud-based APIs, ensuring privacy and control over your AI interactions.
*   **Experiment with Tool-Calling**: Understand and implement how AI models can interact with external services (tools) to augment their capabilities. The project includes a working example of a Wikipedia search tool.
*   **Full-Stack Integration**: See how a modern web frontend communicates with a Node.js backend, which in turn orchestrates interactions with a local AI runtime and external APIs.
*   **Production Deployment**: Learn about deploying such an application using common web server and service management tools like Nginx and Systemd.

## Technology Stack

This application is built using a robust and modern technology stack:

*   **Frontend**:
    *   **React**: A declarative, component-based JavaScript library for building user interfaces.
    *   **TypeScript**: A superset of JavaScript that adds static typing, enhancing code quality and maintainability.
    *   **Vite**: A fast build tool that provides an excellent development experience for modern web projects.
*   **Backend**:
    *   **Node.js (Express)**: A fast, unopinionated, minimalist web framework for Node.js, used to create the API server.
    *   **Ollama Client (`ollama` npm package)**: Facilitates communication with the local Ollama instance.
    *   **`wikijs`**: A Node.js library used to interact with the Wikipedia API for the tool-calling example.
    *   **`sqlite3`**: A lightweight, file-based database for storing user credentials.
    *   **`jsonwebtoken`**: For implementing JWT (JSON Web Token) based authentication.
    *   **`bcryptjs`**: For securely hashing user passwords.
    *   **`dotenv`**: For loading environment variables from a `.env` file.
*   **AI Runtime**:
    *   **Ollama**: A powerful tool for running large language models locally. The backend connects to an Ollama instance, which can be running on the same machine or a separate server (e.g., `logan-linux.tailnet.internal:11434` in this setup).
*   **Infrastructure (for Production Deployment)**:
    *   **Nginx**: A high-performance web server and reverse proxy. It serves the static frontend assets and proxies API requests to the Node.js backend.
    *   **Systemd**: A system and service manager for Linux operating systems, used to manage the Node.js backend as a persistent service.

## Features

*   **Interactive Chat Interface**: A clean and responsive UI for real-time conversations with the AI.
*   **Local AI Inference**: All AI processing is handled by your local Ollama instance, ensuring data privacy and offline capability.
*   **Extensible Tool-Calling**: The backend is designed to allow easy integration of new tools. The current implementation includes:
    *   **Wikipedia Search Tool**: The AI can automatically query Wikipedia for information when prompted (e.g., "Search Wikipedia for quantum physics" or "Wikipedia: Eiffel Tower").
    *   **Weather Tool**: The AI can fetch current weather conditions for a specified location using Open-Meteo API.
*   **Authentication**: Secure access to the chat functionality using JWT (JSON Web Token) based authentication.
*   **Dark Mode**: A toggle for switching between light and dark themes for improved user experience.
*   **Modular Backend**: The backend is structured with separate files for tools and API routes, promoting maintainability and scalability.

## Getting Started (Local Development)

To run this project locally for development:

### Prerequisites

1.  **Node.js and npm**: Ensure you have Node.js (v18 or higher recommended) and npm installed.
2.  **Ollama**: Download and install Ollama from [ollama.com](https://ollama.com/).
3.  **Download an LLM**: Pull a compatible model using Ollama. The project is configured to use `qwen3`, but you can adjust this in `backend/routes/chat.js`.
    ```bash
    ollama pull qwen3
    ```
    Ensure your Ollama instance is running and accessible from your backend (default is `http://localhost:11434`). If it's on a different machine, update the `host` in `backend/server.js`.

### Steps

1.  **Clone the Repository**:
    ```bash
    git clone http://github.com/lpitman/simple-chat-ai
    cd simple-chat-ai
    ```
2.  **Install Frontend Dependencies**:
    ```bash
    npm install
    ```
3.  **Install Backend Dependencies**:
    ```bash
    cd backend
    npm install
    cd ..
    ```
4.  **Authentication Setup (Environment Variables)**:
    The backend now requires environment variables for JWT secret and initial user credentials.
    *   Create a `.env` file in the root directory of the project (same level as `package.json` and `backend/`).
    *   Copy the contents of `.env.example` into your new `.env` file.
    *   **`JWT_SECRET`**: Generate a strong, random string for this. You can use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in your terminal to get one.
    *   **`INITIAL_USERNAME`** and **`INITIAL_PASSWORD`**: Set these to your desired username and password for the primary admin account.
    *   **`GUEST_USERNAME`** and **`GUEST_PASSWORD` (Optional)**: Uncomment and set these if you wish to have a separate guest account.
    
    Example `.env` file:
    ```
    JWT_SECRET=your_super_secret_jwt_key_here_generated_randomly
    INITIAL_USERNAME=admin
    INITIAL_PASSWORD=mySecurePassword123

    # GUEST_USERNAME=guest
    # GUEST_PASSWORD=guestPass
    ```
    
    *Note*: The `backend/db.js` script will automatically create a `database.sqlite` file and populate the `users` table with these credentials the first time the backend server starts.

5.  **Start the Backend Server**:
    ```bash
    cd backend
    npm start
    ```
    The backend will start on `http://localhost:3001`. You should see messages in the console indicating database connection and user creation (if applicable).
6.  **Start the Frontend Development Server**:
    Open a new terminal window, navigate back to the project root (`simple-chat-ai`), and run:
    ```bash
    npm run dev -- --host
    ```
    The frontend will typically be available at `http://localhost:5173` (or another port if 5173 is in use).

You can now interact with your local AI model through the chat interface. Try asking questions that might trigger the Wikipedia tool, like "What is the capital of France?" or "Tell me about the history of the internet from Wikipedia."

## Deployment (Production)

Deploying this application involves setting up Nginx as a reverse proxy for the frontend and backend, and managing the backend as a systemd service.

### Key Deployment Components

*   **Frontend Serving**: Nginx serves the static build assets of the React application.
*   **Backend Proxying**: Nginx proxies API requests from `/api/chat` to the Node.js backend running on `http://localhost:3001` (or an internal IP).
*   **Systemd Service**: The Node.js backend is configured as a systemd service to ensure it starts on boot and automatically restarts if it crashes.

### Nginx Configuration Example

A typical Nginx configuration for this setup would look like this (adjust paths and domain names as necessary):

```nginx
server {
    server_name your_domain.com;

    root /srv/http/simple-chat-ai/dist; # Path to your frontend build
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        # IMPORTANT: The trailing slash on proxy_pass is crucial for correct path mapping.
        proxy_pass http://localhost:3001/api/; 
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Optional: Add SSL configuration (e.g., with Certbot)
    # listen 443 ssl;
    # ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;
    # include /etc/letsencrypt/options-ssl-nginx.conf;
    # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

### Systemd Service Setup

A systemd service file (e.g., `/etc/systemd/system/simple-chat-ai-backend.service`) ensures your backend runs reliably:

```ini
[Unit]
Description=Simple Chat AI Backend Service
After=network.target

[Service]
User=simple-chat-ai-user # Create a dedicated user for security
WorkingDirectory=/opt/simple-chat-ai-backend # Path where your backend code resides
ExecStart=/usr/bin/node server.js # Path to your Node.js executable and server.js
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=simple-chat-ai-backend
Environment="JWT_SECRET=your_super_secret_jwt_key_here"
Environment="INITIAL_USERNAME=admin"
Environment="INITIAL_PASSWORD=mySecurePassword123"
# Environment="GUEST_USERNAME=guest"
# Environment="GUEST_PASSWORD=guestPass"

[Install]
WantedBy=multi-user.target
```
Remember to `sudo systemctl daemon-reload`, `sudo systemctl enable simple-chat-ai-backend.service`, and `sudo systemctl start simple-chat-ai-backend.service` after setting this up. **Crucially, for production, you should set your environment variables directly in the systemd service file or via a secure method like `/etc/environment` or a separate environment file referenced by systemd, rather than relying on a `.env` file.**

### Deployment Script

A separate deployment script (not part of this repository) is recommended for automating the build, copying files, and restarting services on your server. This script would typically:
1.  Pull the latest changes from your Git repository.
2.  Run `npm install` and `npm run build` for the frontend.
3.  Copy the frontend `dist` directory to `/srv/http/simple-chat-ai`.
4.  Run `npm install` for the backend.
5.  Copy the entire backend directory (including `node_modules`) to `/opt/simple-chat-ai-backend`.
6.  Restart the `simple-chat-ai-backend.service` via systemd.

## Extending the Project

### Adding New Tools

To add new tool-calling capabilities:
1.  **Create a new tool file** in `backend/tools/` (e.g., `myNewTool.js`).
2.  **Implement the tool's function**: This function should perform the external action (e.g., fetching weather data, interacting with a database).
3.  **Define the tool's schema for Ollama**: Create an object describing the tool's `name`, `description`, and `parameters` in the format specified by Ollama's tool-calling API.
4.  **Export the function and definition** from the tool file.
5.  **Import the new tool** into `backend/routes/chat.js`.
6.  **Add the tool's function to `availableFunctions`** and its definition to the `tools` array passed to `ollamaClient.chat()`.

### Switching AI Models

To use a different LLM:
1.  **Pull the new model** using Ollama (e.g., `ollama pull mistral`).
2.  **Update the `model` variable** in `backend/routes/chat.js` to the name of your new model (e.g., `'mistral'`).
