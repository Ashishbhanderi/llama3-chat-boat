import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ChatRoom from './components/ChatRoom';
import LoginForm from './components/LoginForm';
import './App.css';

// Use the correct backend URL for the chat server
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
let socket = null;

function App() {
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Test connection to backend
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/health`);
        if (response.ok) {
          setConnectionStatus('connected');
          setIsConnected(true);
        } else {
          setConnectionStatus('disconnected');
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        setConnectionStatus('disconnected');
        setIsConnected(false);
      }
    };

    testConnection();
    
    // Test connection every 10 seconds
    const interval = setInterval(testConnection, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Initialize socket connection
  const initializeSocket = () => {
    if (socket) {
      socket.disconnect();
    }
    
    setConnectionStatus('connecting');
    
    socket = io(BACKEND_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setIsReconnecting(false);
      setConnectionStatus('connected');
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setIsReconnecting(false);
      setConnectionStatus('connected');
      
      // Reconnect user session if user exists
      if (user) {
        socket.emit('reconnect-user', { username: user.username });
      }
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt', attemptNumber);
      setIsReconnecting(true);
      setConnectionStatus('connecting');
    });

    return socket;
  };

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // Initialize socket and try to reconnect
        const savedSocket = initializeSocket();
        
        // Try to reconnect with saved session after connection is established
        savedSocket.on('connect', () => {
          savedSocket.emit('reconnect-user', { username: userData.username });
        });
        
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('chatUser');
      }
    }
  }, []);

  const handleLogin = (username, apiKey, roomId) => {
    const userData = { username, apiKey, roomId };
    setUser(userData);
    
    // Save user data to localStorage
    localStorage.setItem('chatUser', JSON.stringify(userData));
    
    // Initialize socket if not already done
    if (!socket) {
      socket = initializeSocket();
    }
    
    // Wait for connection before joining chat
    if (socket.connected) {
      socket.emit('join-chat', { username, apiKey, roomId });
    } else {
      socket.on('connect', () => {
        socket.emit('join-chat', { username, apiKey, roomId });
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('chatUser');
    
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} connectionStatus={connectionStatus} />;
  }

  return (
    <div className="App">
      {isReconnecting && (
        <div className="reconnecting-banner">
          <div className="reconnecting-content">
            <div className="spinner"></div>
            <span>Reconnecting...</span>
          </div>
        </div>
      )}
      
      <ChatRoom 
        socket={socket} 
        user={user} 
        onLogout={handleLogout}
        isConnected={isConnected}
        isReconnecting={isReconnecting}
      />
    </div>
  );
}

export default App; 