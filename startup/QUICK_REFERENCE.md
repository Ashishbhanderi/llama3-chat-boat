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





lama3-api-mock/
├── startup/ # Startup scripts
│ ├── start.sh # Main startup script
│ ├── deploy.sh # Deployment script
│ ├── package.json # Startup dependencies
│ ├── .env # Environment variables
│ ├── Dockerfile # Docker configuration
│ ├── docker-compose.yml # Docker compose
│ ├── README.md # This file
│ └── QUICK_REFERENCE.md # Quick reference card
├── llama3-api-mock/ # Llama 3 API server
├── chat-app/ # Chat application
├── logs/ # Application logs
├── pids/ # Process IDs
└── data/ # Persistent data