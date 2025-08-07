import React, { useState, useEffect } from 'react';
import { User, Key, Hash, Wifi, WifiOff, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import './LoginForm.css';

const LoginForm = ({ onLogin, connectionStatus }) => {
  const [username, setUsername] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [roomId, setRoomId] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  // Check for existing session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUsername(userData.username);
        setApiKey(userData.apiKey);
        setRoomId(userData.roomId);
        setHasExistingSession(true);
        setSessionData(userData);
      } catch (error) {
        console.error('Error loading saved session:', error);
        localStorage.removeItem('chatUser');
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.trim() && apiKey.trim()) {
      setIsLoading(true);
      // Simulate a brief loading state
      setTimeout(() => {
        onLogin(username.trim(), apiKey.trim(), roomId.trim());
        setIsLoading(false);
      }, 500);
    }
  };

  const handleRestoreSession = () => {
    if (sessionData) {
      setIsLoading(true);
      setTimeout(() => {
        onLogin(sessionData.username, sessionData.apiKey, sessionData.roomId);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleClearSession = () => {
    localStorage.removeItem('chatUser');
    setHasExistingSession(false);
    setSessionData(null);
    setUsername('');
    setApiKey('');
    setRoomId('general');
  };

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi className="status-icon connected" />,
          text: 'Connected',
          color: '#10b981'
        };
      case 'connecting':
        return {
          icon: <RefreshCw className="status-icon connecting spinning" />,
          text: 'Connecting...',
          color: '#f59e0b'
        };
      case 'disconnected':
      default:
        return {
          icon: <WifiOff className="status-icon disconnected" />,
          text: 'Disconnected',
          color: '#ef4444'
        };
    }
  };

  const connectionInfo = getConnectionStatusInfo();

  return (
    <div className="login-container">
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            <Sparkles size={32} style={{ color: '#667eea' }} />
            <h1>CSIPL Chat</h1>
          </div>
          <div className="connection-status">
            {connectionInfo.icon}
            <span style={{ color: connectionInfo.color }}>{connectionInfo.text}</span>
          </div>
          
          {connectionStatus === 'disconnected' && (
            <div className="connection-warning">
              <AlertCircle size={16} />
              <span>Please check your internet connection and try again</span>
            </div>
          )}
        </div>
        
        {hasExistingSession && sessionData && (
          <div className="session-restore">
            <div className="session-info">
              <h3>Welcome back, {sessionData.username}!</h3>
              <p>You have a saved session. Would you like to continue?</p>
            </div>
            <div className="session-actions">
              <button 
                onClick={handleRestoreSession}
                className="restore-session-btn"
                disabled={isLoading || connectionStatus === 'disconnected'}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={16} className="spinning" />
                    Restoring...
                  </div>
                ) : (
                  'Continue Session'
                )}
              </button>
              <button 
                onClick={handleClearSession}
                className="clear-session-btn"
              >
                Start New Session
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              <User size={20} />
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="apiKey">
              <Key size={20} />
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="roomId">
              <Hash size={20} />
              Room ID
            </label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID (default: general)"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading || connectionStatus === 'disconnected'}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="loading" style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid white', borderRadius: '50%' }}></div>
                Connecting...
              </div>
            ) : (
              'Join Chat'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Connect to CSIPL AI for intelligent conversations</p>
          <p style={{ fontSize: '0.8rem', marginTop: '8px', opacity: 0.7 }}>
            Your session will be saved for easy reconnection
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 