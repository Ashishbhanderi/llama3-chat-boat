#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CHAT_APP_PORT=3001
REACT_APP_PORT=3000
OLLAMA_PORT=11434

# API Configuration
OLLAMA_URL=http://localhost:11434/api/generate
LLAMA3_MODEL=llama3
NODE_ENV=development
REQUIRE_AUTH=false

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service_name to be ready on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if check_port $port; then
            print_status "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start on port $port"
    return 1
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        print_status "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null
        sleep 2
    fi
}

# Function to check dependencies
check_dependencies() {
    print_header "Checking Dependencies"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Ollama
    if ! command -v ollama &> /dev/null; then
        print_error "Ollama is not installed. Please install Ollama first."
        print_status "Install with: curl -fsSL https://ollama.ai/install.sh | sh"
        exit 1
    fi
    
    print_status "All dependencies are installed!"
}

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

# Function to start Ollama
start_ollama() {
    print_header "Starting Ollama"
    
    # Check if Ollama is already running
    if check_port $OLLAMA_PORT; then
        print_status "Ollama is already running on port $OLLAMA_PORT"
        return 0
    fi
    
    # Start Ollama
    print_status "Starting Ollama server..."
    ollama serve > ../logs/ollama.log 2>&1 &
    OLLAMA_PID=$!
    echo $OLLAMA_PID > ../pids/ollama.pid
    
    # Wait for Ollama to be ready
    if wait_for_service "Ollama" $OLLAMA_PORT; then
        print_status "Ollama started successfully!"
        
        # Check if Llama 3 model is available
        if ! ollama list | grep -q "llama3"; then
            print_status "Pulling Llama 3 model..."
            ollama pull llama3
        fi
    else
        print_error "Failed to start Ollama"
        exit 1
    fi
}

# Function to start Llama 3 API
start_llama3_api() {
    print_header "Starting Llama 3 API"
    
    # Kill existing process if any
    # kill_port $LLAMA3_API_PORT # This line is removed as LLAMA3_API_PORT is removed
    
    print_status "Starting Llama 3 API server on port $LLAMA3_API_PORT..." # This line is removed as LLAMA3_API_PORT is removed
    cd ../llama3-api-mock
    node index.js > ../logs/llama3-api.log 2>&1 & # This line is removed as index.js is removed
    LLAMA_API_PID=$! # This line is removed as index.js is removed
    echo $LLAMA_API_PID > ../pids/llama3-api.pid # This line is removed as index.js is removed
    cd ../startup
    
    # Wait for API to be ready
    if wait_for_service "Llama 3 API" $LLAMA3_API_PORT; then # This line is removed as LLAMA3_API_PORT is removed
        print_status "Llama 3 API started successfully!" # This line is removed as LLAMA3_API_PORT is removed
    else # This line is removed as LLAMA3_API_PORT is removed
        print_error "Failed to start Llama 3 API" # This line is removed as LLAMA3_API_PORT is removed
        exit 1 # This line is removed as LLAMA3_API_PORT is removed
    fi # This line is removed as LLAMA3_API_PORT is removed
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

# Function to show status
show_status() {
    print_header "Service Status"
    
    echo "Service          Port    Status"
    echo "--------         ----    ------"
    
    if check_port $OLLAMA_PORT; then
        echo "Ollama          $OLLAMA_PORT    ✅ Running"
    else
        echo "Ollama          $OLLAMA_PORT    ❌ Stopped"
    fi
    
    if check_port $CHAT_APP_PORT; then # This line is removed as LLAMA3_API_PORT is removed
        echo "Llama 3 API     $LLAMA3_API_PORT    ✅ Running" # This line is removed as LLAMA3_API_PORT is removed
    else # This line is removed as LLAMA3_API_PORT is removed
        echo "Llama 3 API     $LLAMA3_API_PORT    ❌ Stopped" # This line is removed as LLAMA3_API_PORT is removed
    fi # This line is removed as LLAMA3_API_PORT is removed
    
    if check_port $CHAT_APP_PORT; then
        echo "Chat Backend    $CHAT_APP_PORT    ✅ Running"
    else
        echo "Chat Backend    $CHAT_APP_PORT    ❌ Stopped"
    fi
    
    if check_port $REACT_APP_PORT; then
        echo "React Frontend  $REACT_APP_PORT    ✅ Running"
    else
        echo "React Frontend  $REACT_APP_PORT    ❌ Stopped"
    fi
}

# Function to stop all services
stop_all() {
    print_header "Stopping All Services"
    
    # Read PIDs and kill processes
    for pid_file in ../pids/*.pid; do
        if [ -f "$pid_file" ]; then
            local service=$(basename "$pid_file" .pid)
            local pid=$(cat "$pid_file")
            
            if kill -0 $pid 2>/dev/null; then
                print_status "Stopping $service (PID: $pid)"
                kill $pid
                sleep 2
                if kill -0 $pid 2>/dev/null; then
                    print_warning "Force killing $service"
                    kill -9 $pid
                fi
            fi
            
            rm -f "$pid_file"
        fi
    done
    
    # Kill processes on specific ports
    kill_port $OLLAMA_PORT
    kill_port $CHAT_APP_PORT
    kill_port $REACT_APP_PORT
    
    print_status "All services stopped!"
}

# Function to show logs
show_logs() {
    local service=$1
    
    case $service in
        "ollama")
            tail -f ../logs/ollama.log
            ;;
        "llama3-api")
            tail -f ../logs/llama3-api.log
            ;;
        "chat-backend")
            tail -f ../logs/chat-backend.log
            ;;
        "react-frontend")
            tail -f ../logs/react-frontend.log
            ;;
        *)
            print_error "Unknown service: $service"
            print_status "Available services: ollama, llama3-api, chat-backend, react-frontend"
            ;;
    esac
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start           Start all services"
    echo "  stop            Stop all services"
    echo "  restart         Restart all services"
    echo "  status          Show status of all services"
    echo "  logs [service]  Show logs for a specific service"
    echo "  install         Install all dependencies"
    echo "  check           Check dependencies"
    echo "  help            Show this help message"
    echo ""
    echo "Services: ollama, llama3-api, chat-backend, react-frontend"
    echo ""
    echo "Examples:"
    echo "  $0 start                    # Start all services"
    echo "  $0 logs chat-backend        # Show chat backend logs"
    echo "  $0 status                   # Show status of all services"
}

# Create necessary directories
create_directories() {
    mkdir -p ../logs
    mkdir -p ../pids
    mkdir -p ../data
}

# Main script logic
main() {
    # Create necessary directories
    create_directories
    
    case "${1:-start}" in
        "start")
            check_dependencies
            start_ollama
            start_llama3_api
            start_chat_backend
            start_react_frontend
            
            print_header "All Services Started Successfully!"
            echo ""
            echo "�� Frontend:     http://localhost:$REACT_APP_PORT"
            echo "�� Chat API:     http://localhost:$CHAT_APP_PORT"
            echo "�� Ollama:       http://localhost:$OLLAMA_PORT"
            echo ""
            echo "📝 Logs:         ./logs/"
            echo "🛑 Stop:         $0 stop"
            echo "📊 Status:       $0 status"
            echo ""
            echo "Press Ctrl+C to stop all services"
            
            # Wait for interrupt
            trap 'echo ""; print_header "Stopping Services..."; stop_all; exit 0' INT
            wait
            ;;
        "stop")
            stop_all
            ;;
        "restart")
            stop_all
            sleep 2
            $0 start
            ;;
        "status")
            show_status
            ;;
        "logs")
            if [ -z "$2" ]; then
                print_error "Please specify a service"
                print_status "Available services: ollama, llama3-api, chat-backend, react-frontend"
                exit 1
            fi
            show_logs $2
            ;;
        "install")
            install_dependencies
            ;;
        "check")
            check_dependencies
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 