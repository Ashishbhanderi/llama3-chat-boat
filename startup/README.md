# 🤖 Llama 3 Chat Application

A real-time multi-user chat application powered by Llama 3 AI with persistent conversations, thread management, and beautiful UI.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage](#-usage)
- [Deployment](#-deployment)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Development](#-development)
- [Contributing](#-contributing)

## ✨ Features

### 🧵 **Thread Management**
- **Multiple conversations** with separate contexts
- **Thread switching** with smooth transitions
- **Context preservation** for accurate AI responses
- **Thread renaming** and deletion
- **Persistent storage** across sessions

### 💬 **Real-time Chat**
- **WebSocket communication** for instant messaging
- **AI integration** with Llama 3
- **User notifications** for join/leave events
- **Typing indicators** during AI responses
- **Message history** within threads

### �� **Modern UI**
- **Glass morphism** design with blur effects
- **Responsive layout** for all devices
- **Dark mode support** (system preference)
- **Smooth animations** and transitions
- **Beautiful gradients** and modern styling

### 🔧 **Technical Features**
- **Session persistence** across page refreshes
- **Auto-reconnection** with exponential backoff
- **Error handling** with user-friendly messages
- **Connection status** indicators
- **Data backup** and restore functionality

## ��️ Architecture

```markdown:llama3-api-mock/startup/README.md
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Chat Backend   │    │  Llama 3 API    │
│   (Port 3000)   │◄──►│   (Port 3001)   │◄──►│   (Port 3000)   │
│                 │    │                 │    │                 │
│ • Login Form    │    │ • Socket.IO     │    │ • Express API   │
│ • Chat Room     │    │ • Thread Mgmt   │    │ • Ollama Proxy  │
│ • Thread Sidebar│    │ • Message Store │    │ • Context Mgmt  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Ollama        │
                       │   (Port 11434)  │
                       │                 │
                       │ • Llama 3 Model │
                       │ • AI Inference  │
                       └─────────────────┘
```

## 🚀 Quick Start

### Option 1: Using Startup Script (Recommended)

```bash
# Navigate to startup directory
cd startup

# Make startup script executable
chmod +x start.sh

# Start all services
./start.sh start
```

### Option 2: Manual Start

```bash
# 1. Start Ollama
ollama serve

# 2. Pull Llama 3 model
ollama pull llama3

# 3. Start Llama 3 API
cd ../llama3-api-mock
node index.js

# 4. Start Chat Backend (new terminal)
cd ../chat-app
npm start

# 5. Start React Frontend (new terminal)
cd ../chat-app/client
npm start
```

### Option 3: Docker Deployment

```bash
docker-compose up -d
```

## 📦 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Ollama** (for Llama 3 model)

### Install Ollama

```bash
# Linux/macOS
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### Install Dependencies

```bash
# Install all dependencies
./start.sh install

# Or install manually:
# Install Llama 3 API dependencies
cd ../llama3-api-mock
npm install

# Install Chat App dependencies
cd ../chat-app
npm install

# Install React App dependencies
cd client
npm install
```

### Pull Llama 3 Model

```bash
# Start Ollama
ollama serve

# Pull the model
ollama pull llama3
```

## 🎯 Usage

### Starting the Application

```bash
./start.sh start
```

### Available Commands

```bash
./start.sh start          # Start all services
./start.sh stop           # Stop all services
./start.sh restart        # Restart all services
./start.sh status         # Show service status
./start.sh logs service   # Show logs for specific service
./start.sh install        # Install dependencies
./start.sh check          # Check dependencies
```

### Using the Chat Application

1. **Open your browser** and go to `http://localhost:3000`
2. **Enter your credentials**:
   - Username: Any name you want to use
   - API Key: Your Bearer token (or any string for testing)
   - Room ID: Choose a room (default: general)
3. **Click "Join Chat"** to start chatting
4. **Create new threads** using the sidebar
5. **Switch between conversations** by clicking on threads

### Features Guide

####  Thread Management
- **Create Thread**: Click "New" button in sidebar
- **Rename Thread**: Click edit icon on active thread
- **Delete Thread**: Click trash icon on active thread
- **Switch Thread**: Click on any thread in sidebar

####  Chat Features
- **Send Message**: Type and press Enter or click send
- **AI Response**: Llama 3 will respond automatically
- **Context**: AI remembers conversation history
- **Real-time**: See messages as they're sent

####  Advanced Features
- **Session Persistence**: Login once, stay logged in
- **Auto-reconnection**: Handles network issues
- **Connection Status**: See real-time connection state
- **Error Recovery**: Automatic retry on failures

## 🚀 Deployment

### Local Development

```bash
# Development mode
./start.sh start

# View logs
./start.sh logs chat-backend
```

### Production Deployment

#### Option 1: System Service

```bash
# Deploy as system service
./deploy.sh

# Start service
sudo systemctl start llama3-chat

# Check status
sudo systemctl status llama3-chat
```

#### Option 2: Docker

```bash
# Build and run with Docker
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Option 3: Manual Production

```bash
# Set production environment
export NODE_ENV=production

# Build React app
cd ../chat-app/client
npm run build

# Start services
cd ../../startup
./start.sh start
```

### Environment Variables

Create `.env` file in startup directory:

```bash
# Port Configuration
LLAMA3_API_PORT=3000
CHAT_APP_PORT=3001
REACT_APP_PORT=3000
OLLAMA_PORT=11434

# API Configuration
LLAMA3_API_URL=http://localhost:3000/api/chat
NODE_ENV=production
REQUIRE_AUTH=false

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
```

## ⚙️ Configuration

### Port Configuration

| Service | Default Port | Description |
|---------|-------------|-------------|
| React App | 3000 | Frontend application |
| Chat Backend | 3001 | WebSocket and API server |
| Llama 3 API | 3000 | AI API server |
| Ollama | 11434 | AI model server |

### API Configuration

```javascript
// Llama 3 API Configuration
LLAMA3_API_URL=http://localhost:3000/api/chat
LLAMA3_MODEL=llama3
API_TIMEOUT=30000

// Chat App Configuration
SOCKET_CORS_ORIGIN=http://localhost:3000
REQUIRE_AUTH=false
```

### Data Storage

```
../data/
├── threads.json      # User threads data
├── rooms.json        # Room messages data
└── sessions.json     # User sessions data

../logs/
├── ollama.log        # Ollama server logs
├── llama3-api.log    # Llama 3 API logs
├── chat-backend.log  # Chat backend logs
└── react-frontend.log # React app logs
```

## 🛠️ API Reference

### REST Endpoints

#### Health Check
```bash
GET /api/health
```
Returns server status and statistics.

#### Rooms
```bash
GET /api/rooms
```
Returns list of active chat rooms.

#### Users
```bash
GET /api/users
```
Returns list of active users.

#### Session
```bash
GET /api/session/:username
```
Check if user has active session.

#### Export Threads
```bash
GET /api/export-threads/:username
```
Export user's threads data.

#### Import Threads
```bash
POST /api/import-threads/:username
Content-Type: application/json

{
  "threads": [...]
}
```

### WebSocket Events

#### Client to Server
- `join-chat`: Join chat room
- `reconnect-user`: Reconnect user session
- `create-thread`: Create new conversation thread
- `switch-thread`: Switch to different thread
- `rename-thread`: Rename thread
- `delete-thread`: Delete thread
- `send-message`: Send chat message

#### Server to Client
- `user-threads`: User's thread list
- `thread-history`: Thread message history
- `new-message`: New message received
- `user-joined`: User joined room
- `user-left`: User left room
- `error`: Error message

### Message Format

```javascript
{
  id: "uuid",
  username: "string",
  message: "string",
  timestamp: "Date",
  type: "user|ai|system"
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Ollama Not Starting
```bash
# Check if Ollama is installed
ollama --version

# Start Ollama manually
ollama serve

# Check if model is available
ollama list
```

#### 2. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Kill the process
kill -9 <PID>
```

#### 3. Connection Issues
```bash
# Check service status
./start.sh status

# View logs
./start.sh logs chat-backend

# Test API endpoints
curl http://localhost:3001/api/health
```

#### 4. React App Not Loading
```bash
# Check if React dev server is running
lsof -i :3000

# Restart React app
cd ../chat-app/client
npm start
```

### Debug Commands

```bash
# Check all service status
./start.sh status

# View specific service logs
./start.sh logs ollama
./start.sh logs llama3-api
./start.sh logs chat-backend
./start.sh logs react-frontend

# Test API endpoints
curl http://localhost:3001/api/health
curl http://localhost:3000/api/chat

# Check Ollama
curl http://localhost:11434/api/tags
```

### Log Locations

```
../logs/
├── ollama.log           # Ollama server logs
├── llama3-api.log       # Llama 3 API logs
├── chat-backend.log     # Chat backend logs
└── react-frontend.log   # React frontend logs
```

## 🛠️ Development

### Project Structure

```
llama3-api-mock/
├── startup/                 # Startup scripts
│   ├── start.sh            # Main startup script
│   ├── deploy.sh           # Deployment script
│   ├── package.json        # Startup dependencies
│   ├── .env               # Environment variables
│   ├── Dockerfile         # Docker configuration
│   ├── docker-compose.yml # Docker compose
│   ├── README.md          # This file
│   └── QUICK_REFERENCE.md # Quick reference card
├── llama3-api-mock/        # Llama 3 API server
├── chat-app/              # Chat application
├── logs/                  # Application logs
├── pids/                  # Process IDs
└── data/                  # Persistent data
```

### Development Commands

```bash
# Install all dependencies
./start.sh install

# Start in development mode
./start.sh start

# View logs in real-time
./start.sh logs chat-backend

# Restart specific service
./start.sh restart

# Check dependencies
./start.sh check
```

### Adding New Features

#### Backend Features
1. Add new endpoints in `../llama3-api-mock/index.js`
2. Add new Socket.IO events in `../chat-app/server.js`
3. Update API documentation

#### Frontend Features
1. Add new components in `../chat-app/client/src/components/`
2. Update styling in CSS files
3. Add new routes in React app

#### Configuration
1. Update environment variables in `.env`
2. Update startup script in `start.sh`
3. Update deployment scripts

### Testing

```bash
# Test API endpoints
curl http://localhost:3001/api/health
curl http://localhost:3000/api/chat

# Test WebSocket connection
# Use browser developer tools or WebSocket client

# Test Ollama
curl http://localhost:11434/api/tags
```

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/llama3-chat.git
   cd llama3-chat/startup
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes**
5. **Test your changes**
   ```bash
   ./start.sh start
   ```
6. **Commit your changes**
   ```bash
   git commit -m "Add your feature description"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request**

### Code Style

- **JavaScript**: Use ES6+ features, consistent indentation
- **CSS**: Use BEM methodology, consistent naming
- **Comments**: Add comments for complex logic
- **Error Handling**: Always handle errors gracefully

### Testing Guidelines

- Test all new features manually
- Ensure backward compatibility
- Test error scenarios
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **Ollama** for providing the Llama 3 model
- **Socket.IO** for real-time communication
- **React** for the frontend framework
- **Express** for the backend framework

## 📞 Support

If you encounter any issues or have questions:

1. **Check the troubleshooting section** above
2. **View the logs** using `./start.sh logs service`
3. **Check the status** using `./start.sh status`
4. **Create an issue** on GitHub with:
   - Description of the problem
   - Steps to reproduce
   - Logs from the affected service
   - Your system information

---

**Happy Chatting! 🤖**
```

```markdown:llama3-api-mock/startup/QUICK_REFERENCE.md
# 🚀 Quick Reference Card

## Start Application
```bash
./start.sh start
```

## Stop Application
```bash
./start.sh stop
```

## Check Status
```bash
./start.sh status
```

## View Logs
```bash
./start.sh logs service-name
```

## Restart Services
```bash
./start.sh restart
```

## URLs
- **Frontend**: http://localhost:3000
- **Chat API**: http://localhost:3001
- **Llama 3 API**: http://localhost:3000/api
- **Ollama**: http://localhost:11434

## Common Commands
```bash
# Install dependencies
./start.sh install

# Check dependencies
./start.sh check

# Deploy as service
./deploy.sh

# Docker deployment
docker-compose up -d
```

## Troubleshooting
```bash
# Check all services
./start.sh status

# View specific logs
./start.sh logs chat-backend

# Test API
curl http://localhost:3001/api/health

# Kill processes on ports
lsof -i :3000
kill -9 <PID>
```

## Service Names
- `ollama` - Ollama server
- `llama3-api` - Llama 3 API server
- `chat-backend` - Chat application backend
- `react-frontend` - React frontend

## File Locations
- **Logs**: `../logs/`
- **Data**: `../data/`
- **PIDs**: `../pids/`
- **Config**: `.env`

## Environment Variables
```bash
LLAMA3_API_PORT=3000
CHAT_APP_PORT=3001
REACT_APP_PORT=3000
OLLAMA_PORT=11434
LLAMA3_API_URL=http://localhost:3000/api/chat
NODE_ENV=development
```
```

## Updated Directory Structure

```
llama3-api-mock/
├── startup/                 # 🚀 Main startup directory
│   ├── start.sh            # Main startup script
│   ├── deploy.sh           # Deployment script
│   ├── package.json        # Startup dependencies
│   ├── .env               # Environment variables
│   ├── Dockerfile         # Docker configuration
│   ├── docker-compose.yml # Docker compose
│   ├── README.md          # 📖 Comprehensive documentation
│   └── QUICK_REFERENCE.md # 🚀 Quick reference card
├── llama3-api-mock/        # Llama 3 API server
├── chat-app/              # Chat application
├── logs/                  # Application logs
├── pids/                  # Process IDs
└── data/                  # Persistent data
```

## Updated Startup Script Path References

```bash:llama3-api-mock/startup/start.sh
# Update the script to use relative paths from startup directory
#!/bin/bash

# ... (existing code) ...

# Function to install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    # Install Llama 3 API dependencies
    print_status "Installing Llama 3 API dependencies..."
    cd ../llama3-api-mock
    npm install
    
    # Install Chat App dependencies
    print_status "Installing Chat App dependencies..."
    cd ../chat-app
    npm install
    
    # Install React App dependencies
    print_status "Installing React App dependencies..."
    cd client
    npm install
    cd ../../startup
    
    print_status "All dependencies installed!"
}

# Function to start Llama 3 API
start_llama3_api() {
    print_header "Starting Llama 3 API"
    
    # Kill existing process if any
    kill_port $LLAMA3_API_PORT
    
    print_status "Starting Llama 3 API server on port $LLAMA3_API_PORT..."
    cd ../llama3-api-mock
    node index.js > ../logs/llama3-api.log 2>&1 &
    LLAMA_API_PID=$!
    echo $LLAMA_API_PID > ../pids/llama3-api.pid
    cd ../startup
    
    # Wait for API to be ready
    if wait_for_service "Llama 3 API" $LLAMA3_API_PORT; then
        print_status "Llama 3 API started successfully!"
    else
        print_error "Failed to start Llama 3 API"
        exit 1
    fi
}

# Function to start Chat App Backend
start_chat_backend() {
    print_header "Starting Chat App Backend"
    
    # Kill existing process if any
    kill_port $CHAT_APP_PORT
    
    print_status "Starting Chat App backend on port $CHAT_APP_PORT..."
    cd ../chat-app
    npm start > ../logs/chat-backend.log 2>&1 &
    CHAT_BACKEND_PID=$!
    echo $CHAT_BACKEND_PID > ../pids/chat-backend.pid
    cd ../startup
    
    # Wait for backend to be ready
    if wait_for_service "Chat Backend" $CHAT_APP_PORT; then
        print_status "Chat Backend started successfully!"
    else
        print_error "Failed to start Chat Backend"
        exit 1
    fi
}

# Function to start React Frontend
start_react_frontend() {
    print_header "Starting React Frontend"
    
    # Kill existing process if any
    kill_port $REACT_APP_PORT
    
    print_status "Starting React frontend on port $REACT_APP_PORT..."
    cd ../chat-app/client
    npm start > ../../logs/react-frontend.log 2>&1 &
    REACT_PID=$!
    echo $REACT_PID > ../../pids/react-frontend.pid
    cd ../../startup
    
    # Wait for frontend to be ready
    if wait_for_service "React Frontend" $REACT_APP_PORT; then
        print_status "React Frontend started successfully!"
    else
        print_error "Failed to start React Frontend"
        exit 1
    fi
}

# ... (rest of the script remains the same) ...
```

Now everything is organized in the startup directory with comprehensive documentation and quick reference guides. Users can simply navigate to the startup directory and use the commands from there! 