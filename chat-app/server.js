require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const LLAMA3_MODEL = process.env.LLAMA3_MODEL || 'llama3';

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const THREADS_FILE = path.join(DATA_DIR, 'threads.json');
const ROOMS_FILE = path.join(DATA_DIR, 'rooms.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Store active users and their sessions
const activeUsers = new Map();
const chatRooms = new Map();
const userThreads = new Map(); // Store threads per user
const userSessions = new Map(); // Store user sessions for reconnection

// Store active streaming connections
const activeStreams = new Map();

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Load data from files
async function loadData() {
  try {
    await ensureDataDir();
    
    // Load threads data
    try {
      const threadsData = await fs.readFile(THREADS_FILE, 'utf8');
      const threads = JSON.parse(threadsData);
      userThreads.clear();
      Object.keys(threads).forEach(username => {
        userThreads.set(username, threads[username]);
      });
      console.log(`Loaded threads data for ${userThreads.size} users`);
    } catch (error) {
      console.log('No existing threads data found, starting fresh');
    }
    
    // Load rooms data
    try {
      const roomsData = await fs.readFile(ROOMS_FILE, 'utf8');
      const rooms = JSON.parse(roomsData);
      chatRooms.clear();
      Object.keys(rooms).forEach(roomId => {
        // Convert activeThreads back to Map
        const room = rooms[roomId];
        if (room.activeThreads && typeof room.activeThreads === 'object') {
          room.activeThreads = new Map(Object.entries(room.activeThreads));
        } else {
          room.activeThreads = new Map();
        }
        chatRooms.set(roomId, room);
      });
      console.log(`Loaded rooms data for ${chatRooms.size} rooms`);
    } catch (error) {
      console.log('No existing rooms data found, starting fresh');
    }

    // Load sessions data
    try {
      const sessionsData = await fs.readFile(SESSIONS_FILE, 'utf8');
      const sessions = JSON.parse(sessionsData);
      userSessions.clear();
      Object.keys(sessions).forEach(username => {
        userSessions.set(username, sessions[username]);
      });
      console.log(`Loaded sessions data for ${userSessions.size} users`);
    } catch (error) {
      console.log('No existing sessions data found, starting fresh');
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Save data to files
async function saveData() {
  try {
    await ensureDataDir();
    
    // Save threads data
    const threadsData = {};
    userThreads.forEach((threads, username) => {
      threadsData[username] = threads;
    });
    await fs.writeFile(THREADS_FILE, JSON.stringify(threadsData, null, 2));
    
    // Save rooms data
    const roomsData = {};
    chatRooms.forEach((room, roomId) => {
      // Convert Map to object for JSON serialization
      const roomCopy = { ...room };
      if (room.activeThreads instanceof Map) {
        roomCopy.activeThreads = Object.fromEntries(room.activeThreads);
      }
      roomsData[roomId] = roomCopy;
    });
    await fs.writeFile(ROOMS_FILE, JSON.stringify(roomsData, null, 2));
    
    // Save sessions data
    const sessionsData = {};
    userSessions.forEach((session, username) => {
      sessionsData[username] = session;
    });
    await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessionsData, null, 2));
    
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Call Ollama without streaming (for API endpoints)
async function callOllama(prompt, options = {}) {
  try {
    console.log('Calling Ollama with prompt:', prompt.substring(0, 100) + '...');
    console.log('Ollama URL:', OLLAMA_URL);
    console.log('Model:', LLAMA3_MODEL);
    
    // Ensure model is always set
    if (!LLAMA3_MODEL) {
      throw new Error('LLAMA3_MODEL is not set');
    }
    
    const requestBody = {
      model: LLAMA3_MODEL,
      prompt: prompt,
      stream: false, // Get full response, not stream
      ...options
    };
    
    console.log('Request body:', requestBody);
    
    const response = await axios.post(OLLAMA_URL, requestBody, {
      timeout: 60000, // 60 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Ollama response status:', response.status);
    console.log('Ollama response data:', JSON.stringify(response.data, null, 2));
    
    // Handle different response formats from Ollama
    let result = null;
    
    if (response.data.response) {
      result = response.data.response;
    } else if (response.data.completion) {
      result = response.data.completion;
    } else if (response.data.answer) {
      result = response.data.answer;
    } else if (response.data.text) {
      result = response.data.text;
    } else if (response.data.content) {
      result = response.data.content;
    } else if (typeof response.data === 'string') {
      result = response.data;
    } else if (response.data.message && response.data.message.content) {
      result = response.data.message.content;
    } else {
      // If none of the above, try to extract from the full response
      console.log('No standard response field found, trying to extract from full response');
      result = JSON.stringify(response.data);
    }
    
    if (!result || result.trim() === '') {
      throw new Error('Empty response from Ollama');
    }
    
    console.log('Extracted result:', result);
    return result;
    
  } catch (error) {
    console.error('Error calling Ollama:', error.message);
    console.error('Error details:', error.response?.data || error.message);
    
    // Check if it's a model not found error
    if (error.response?.status === 404) {
      throw new Error('Llama 3 model not found. Please run: ollama pull llama3');
    }
    
    // Check if Ollama is not running
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama is not running. Please start Ollama with: ollama serve');
    }
    
    // Check for model required error
    if (error.response?.data?.error === 'model is required') {
      throw new Error('Model is required. Please check LLAMA3_MODEL environment variable');
    }
    
    throw new Error(`Ollama API error: ${error.message}`);
  }
}

// Helper to call Llama 3 with context
async function callLlama3(prompt, apiKey, context = []) {
  try {
    // Build context string from previous messages
    let contextString = '';
    if (context.length > 0) {
      contextString = context.map(msg => 
        `${msg.username}: ${msg.message}`
      ).join('\n') + '\n\n';
    }

    const fullPrompt = contextString + prompt;
    
    console.log('Calling Ollama with context prompt:', fullPrompt.substring(0, 100) + '...');
    
    const answer = await callOllama(fullPrompt);
    console.log('AI response:', answer.substring(0, 100) + '...');
    
    return answer;
  } catch (error) {
    console.error('Llama 3 API error:', error.message);
    console.error('Error details:', error.response?.data || error.message);
    
    // Provide more specific error messages
    if (error.code === 'ECONNREFUSED') {
      return 'Error: Ollama is not running. Please start Ollama with: ollama serve';
    }
    
    if (error.response?.status === 404) {
      return 'Error: Llama 3 model not found. Please run: ollama pull llama3';
    }
    
    if (error.code === 'ETIMEDOUT') {
      return 'Error: Request timed out. The AI model might be busy or not responding.';
    }
    
    return `Error: ${error.message}. Please check if Ollama is running and the llama3 model is available.`;
  }
}

// Test Ollama connection
async function testOllamaConnection() {
  try {
    console.log('Testing Ollama connection...');
    
    // Test if Ollama is running
    const healthResponse = await axios.get('http://localhost:11434/api/tags');
    console.log('Ollama is running, available models:', healthResponse.data);
    
    // Check if llama3 model is available
    const models = healthResponse.data.models || [];
    const llama3Model = models.find(model => model.name === 'llama3');
    
    if (!llama3Model) {
      console.warn('Llama 3 model not found. Available models:', models.map(m => m.name));
      console.warn('Please run: ollama pull llama3');
    } else {
      console.log('Llama 3 model is available');
    }
    
  } catch (error) {
    console.error('Ollama connection test failed:', error.message);
    console.error('Please make sure Ollama is running: ollama serve');
  }
}

// Helper to get thread context (last 10 messages for context)
function getThreadContext(threadId, roomId) {
  const room = chatRooms.get(roomId);
  if (!room || !room.threads || !room.threads[threadId]) {
    return [];
  }
  
  const threadMessages = room.threads[threadId];
  // Return last 10 messages for context
  return threadMessages.slice(-10);
}

// Streaming function with abort support
async function callOllamaStreamWithAbort(prompt, signal, onChunk) {
  try {
    const response = await axios.post(
      OLLAMA_URL,
      { 
        model: LLAMA3_MODEL, 
        prompt: prompt + "\n\nPlease format your response with proper markdown when appropriate.",
        stream: true 
      },
      { 
        responseType: 'stream', 
        headers: { 'Content-Type': 'application/json' },
        signal: signal // Add abort signal
      }
    );

    return new Promise((resolve, reject) => {
      let full = '';
      
      response.data.on('data', chunk => {
        const lines = chunk.toString().split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              full += data.response;
              onChunk({ type: 'chunk', content: data.response });
            }
            if (data.done) {
              onChunk({ type: 'done', content: full });
              resolve(full);
            }
          } catch (e) {
            // Ignore non-JSON lines
          }
        }
      });
      
      response.data.on('end', () => {
        onChunk({ type: 'done', content: full });
        resolve(full);
      });
      
      response.data.on('error', reject);
    });
    
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error; // Re-throw abort errors
    }
    throw new Error(`Ollama API error: ${error.message}`);
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins chat
  socket.on('join-chat', async (data) => {
    const { username, apiKey, roomId = 'general' } = data;
    
    // Store user info
    activeUsers.set(socket.id, { username, apiKey, roomId });
    
    // Store session for reconnection
    userSessions.set(username, {
      username,
      apiKey,
      roomId,
      lastSeen: new Date(),
      socketId: socket.id
    });
    
    // Join room
    socket.join(roomId);
    
    // Initialize room if it doesn't exist
    if (!chatRooms.has(roomId)) {
      chatRooms.set(roomId, {
        id: roomId,
        name: roomId === 'general' ? 'General Chat' : roomId,
        users: new Set(),
        threads: {},
        activeThreads: new Map()
      });
    }
    
    const room = chatRooms.get(roomId);
    
    // Ensure room.users is a Set
    if (!room.users || !(room.users instanceof Set)) {
      room.users = new Set();
    }
    
    // Add user to room
    room.users.add(username);
    
    // Load user's threads - FIXED: Ensure threads are loaded properly
    if (!userThreads.has(username)) {
      userThreads.set(username, []);
    }
    
    // Send existing threads to user
    const userThreadList = userThreads.get(username) || [];
    socket.emit('threads-loaded', { threads: userThreadList });
    
    // Get user's active thread or default to 'default'
    const activeThread = room.activeThreads.get(username) || 'default';
    
    // Initialize thread if it doesn't exist
    if (!room.threads[activeThread]) {
      room.threads[activeThread] = [];
    }
    
    // Send existing messages in the active thread
    const roomMessages = room.threads[activeThread] || [];
    socket.emit('messages-loaded', { 
      messages: roomMessages,
      activeThread: activeThread
    });
    
    // Notify others in room
    socket.to(roomId).emit('user-joined', { username });
    
    console.log(`User ${username} joined room ${roomId} with ${userThreadList.length} threads`);
  });

  // Handle thread switching
  socket.on('switch-thread', async (data) => {
    const { threadId } = data;
    const user = activeUsers.get(socket.id);
    
    if (!user) {
      socket.emit('error', { message: 'User not authenticated' });
      return;
    }
    
    const { username, roomId } = user;
    const room = chatRooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    // Set active thread for user
    room.activeThreads.set(username, threadId);
    
    // Initialize thread if it doesn't exist
    if (!room.threads[threadId]) {
      room.threads[threadId] = [];
    }
    
    // Send messages for this thread
    const threadMessages = room.threads[threadId] || [];
    socket.emit('messages-loaded', { 
      messages: threadMessages,
      activeThread: threadId
    });
    
    console.log(`User ${username} switched to thread ${threadId}`);
  });

  // Handle new thread creation
  socket.on('create-thread', async (data) => {
    const { threadName } = data;
    const user = activeUsers.get(socket.id);
    
    if (!user) {
      socket.emit('error', { message: 'User not authenticated' });
      return;
    }
    
    const { username } = user;
    
    // Get user's threads
    if (!userThreads.has(username)) {
      userThreads.set(username, []);
    }
    
    const userThreadList = userThreads.get(username);
    
    // Create new thread
    const newThread = {
      id: uuidv4(),
      name: threadName,
      createdAt: new Date().toISOString()
    };
    
    userThreadList.push(newThread);
    
    // Save data
    await saveData();
    
    // Send updated threads list
    socket.emit('threads-loaded', { threads: userThreadList });
    
    console.log(`User ${username} created new thread: ${threadName}`);
  });

  // Handle stop generation
  socket.on('stop-generation', (data) => {
    const { messageId } = data;
    const streamKey = `${socket.id}-${messageId}`;
    
    if (activeStreams.has(streamKey)) {
      const stream = activeStreams.get(streamKey);
      stream.abort(); // Abort the axios request
      activeStreams.delete(streamKey);
      
      // Update the message to show it was stopped
      socket.emit('generation-stopped', { messageId });
      console.log(`Generation stopped for message ${messageId}`);
    }
  });

  // Handle new message with streaming and stop capability
  socket.on('send-message', async (data) => {
    const { message, threadId = 'default' } = data;
    const user = activeUsers.get(socket.id);
    
    if (!user) {
      socket.emit('error', { message: 'User not authenticated' });
      return;
    }
    
    const { username, roomId } = user;
    
    // Initialize room if needed
    if (!chatRooms.has(roomId)) {
      chatRooms.set(roomId, {
        id: roomId,
        name: roomId === 'general' ? 'General Chat' : roomId,
        users: new Set(),
        threads: {},
        activeThreads: new Map()
      });
    }
    
    const room = chatRooms.get(roomId);
    
    // Initialize thread if needed
    if (!room.threads[threadId]) {
      room.threads[threadId] = [];
    }
    
    // Add user message to thread
    const userMessage = {
      id: uuidv4(),
      username,
      message,
      timestamp: new Date().toISOString(),
      type: 'user'
    };
    
    room.threads[threadId].push(userMessage);
    room.activeThreads.set(username, threadId);
    
    // Save data immediately
    await saveData();
    
    // Broadcast user message to room
    socket.to(roomId).emit('new-message', userMessage);
    
    // Send confirmation to sender
    socket.emit('message-sent', userMessage);
    
    // Get context for AI response
    const context = getThreadContext(threadId, roomId);
    
    // Create AI message placeholder
    const aiMessage = {
      id: uuidv4(),
      username: 'Llama 3 AI',
      message: '',
      timestamp: new Date().toISOString(),
      type: 'ai',
      isStreaming: true
    };
    
    // Add AI message to thread
    room.threads[threadId].push(aiMessage);
    
    // Broadcast AI message start to room
    socket.to(roomId).emit('ai-message-start', aiMessage);
    socket.emit('ai-message-start', aiMessage);
    
    try {
      // Build context string
      let contextString = '';
      if (context.length > 0) {
        contextString = context.map(msg => 
          `${msg.username}: ${msg.message}`
        ).join('\n') + '\n\n';
      }
      
      const fullPrompt = contextString + message;
      
      // Create abort controller for stopping generation
      const controller = new AbortController();
      const streamKey = `${socket.id}-${aiMessage.id}`;
      activeStreams.set(streamKey, controller);
      
      // Stream the AI response with abort capability
      await callOllamaStreamWithAbort(fullPrompt, controller.signal, async (chunk) => {
        if (chunk.type === 'chunk') {
          // Update AI message with new chunk
          aiMessage.message += chunk.content;
          
          // Broadcast chunk to room
          socket.to(roomId).emit('ai-message-chunk', {
            messageId: aiMessage.id,
            content: chunk.content
          });
          socket.emit('ai-message-chunk', {
            messageId: aiMessage.id,
            content: chunk.content
          });
        } else if (chunk.type === 'done') {
          // Finalize AI message
          aiMessage.message = chunk.content;
          aiMessage.isStreaming = false;
          
          // Broadcast completion to room
          socket.to(roomId).emit('ai-message-done', {
            messageId: aiMessage.id,
            content: aiMessage.message
          });
          socket.emit('ai-message-done', {
            messageId: aiMessage.id,
            content: aiMessage.message
          });
          
          // Save data after response is complete
          await saveData();
        }
      });
      
      // Clean up stream reference
      activeStreams.delete(streamKey);
      
    } catch (error) {
      console.error('Error in AI response:', error);
      
      // Check if it was aborted
      if (error.name === 'AbortError') {
        aiMessage.message += '\n\n*Generation stopped by user*';
      } else {
        aiMessage.message = `Error: ${error.message}`;
      }
      
      aiMessage.isStreaming = false;
      
      // Broadcast error to room
      socket.to(roomId).emit('ai-message-done', {
        messageId: aiMessage.id,
        content: aiMessage.message
      });
      socket.emit('ai-message-done', {
        messageId: aiMessage.id,
        content: aiMessage.message
      });
      
      // Clean up stream reference
      const streamKey = `${socket.id}-${aiMessage.id}`;
      activeStreams.delete(streamKey);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      console.log(`User ${user.username} disconnected`);
      activeUsers.delete(socket.id);
      
      // Update session
      if (userSessions.has(user.username)) {
        const session = userSessions.get(user.username);
        session.lastSeen = new Date();
        userSessions.set(user.username, session);
      }
    }
  });
});

// API Routes
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, apiKey } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    console.log('API Chat request:', prompt.substring(0, 100) + '...');
    
    const answer = await callLlama3(prompt, apiKey);
    
    res.json({ answer });
  } catch (error) {
    console.error('API Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    activeUsers: activeUsers.size,
    rooms: chatRooms.size
  });
});

// Test Ollama connection endpoint
app.get('/api/test-ollama', async (req, res) => {
  try {
    await testOllamaConnection();
    res.json({ status: 'ok', message: 'Ollama connection test completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get rooms endpoint
app.get('/api/rooms', (req, res) => {
  const rooms = Array.from(chatRooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    userCount: room.users.size
  }));
  res.json({ rooms });
});

// Get users endpoint
app.get('/api/users', (req, res) => {
  const users = Array.from(activeUsers.values()).map(user => ({
    username: user.username,
    roomId: user.roomId
  }));
  res.json({ users });
});

// Catch all handler for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Start server function
async function startServer() {
  try {
    // Load existing data
    await loadData();
    
    // Test Ollama connection
    await testOllamaConnection();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Chat server running on port ${PORT}`);
      console.log(`📱 Frontend: http://localhost:${PORT}`);
      console.log(`🔌 Socket.IO: ws://localhost:${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
    
    // Save data periodically
    setInterval(saveData, 30000); // Save every 30 seconds
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 