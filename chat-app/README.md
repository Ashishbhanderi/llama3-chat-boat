# Llama 3 Chat Application

A real-time multi-user chat application that integrates with Llama 3 AI for intelligent conversations.

## Features

- **Real-time Chat**: Multiple users can chat simultaneously
- **AI Integration**: Llama 3 AI responds to user messages
- **Room-based Chat**: Users can join different chat rooms
- **Modern UI**: Beautiful, responsive design
- **Connection Status**: Real-time connection indicators
- **Message History**: View previous messages in the room

## Prerequisites

1. **Llama 3 API Server**: Make sure your Llama 3 API server is running on port 3000
2. **Node.js**: Version 14 or higher
3. **npm**: For package management

## Installation

1. **Clone or navigate to the chat-app directory**
   ```bash
   cd chat-app
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Set up environment variables** (optional)
   Create a `.env` file in the root directory:
   ```env
   PORT=3001
   LLAMA3_API_URL=http://localhost:3000/api/chat
   ```

## Running the Application

1. **Start the chat server**
   ```bash
   npm start
   ```

2. **Open your browser**
   Navigate to `http://localhost:3001`

3. **Join the chat**
   - Enter your username
   - Provide your API key (Bearer token)
   - Choose a room ID (default: general)
   - Click "Join Chat"

## Usage

### Joining a Chat
1. Enter your username (this will be displayed to other users)
2. Provide your API key (the Bearer token for your Llama 3 API)
3. Choose a room ID (users in the same room can chat together)
4. Click "Join Chat"

### Sending Messages
- Type your message in the input field
- Press Enter or click the send button
- The AI will respond automatically

### Features
- **Real-time messaging**: See messages as they're sent
- **AI responses**: Llama 3 AI responds to your messages
- **User notifications**: See when users join or leave
- **Connection status**: Monitor your connection to the server
- **Responsive design**: Works on desktop and mobile

## API Integration

The chat application connects to your Llama 3 API server running on port 3000. Make sure:

1. Your API server is running on `http://localhost:3000`
2. The `/api/chat` endpoint accepts POST requests with:
   - `prompt`: The user's message
   - `Authorization`: Bearer token header
3. The API returns responses in the format: `{ answer: "AI response" }`

## Troubleshooting

### Connection Issues
- Ensure your Llama 3 API server is running on port 3000
- Check that your API key is valid
- Verify the API endpoint is accessible

### Build Issues
- Make sure all dependencies are installed
- Try deleting `node_modules` and running `npm install` again

### Runtime Issues
- Check the browser console for errors
- Verify the server is running on the correct port
- Ensure your API key has the necessary permissions

## Development

### Project Structure
```
chat-app/
├── server.js          # Express server with Socket.IO
├── client/            # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatRoom.js
│   │   │   └── LoginForm.js
│   │   └── App.js
│   └── public/
└── package.json
```

### Adding Features
- **New message types**: Modify the message handling in `server.js`
- **UI improvements**: Edit the React components in `client/src/components/`
- **API integration**: Update the `callLlama3` function in `server.js`

## License

This project is open source and available under the MIT License. 