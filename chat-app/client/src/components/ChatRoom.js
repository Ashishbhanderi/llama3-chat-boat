import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  LogOut, 
  Users, 
  MessageSquare, 
  Sparkles, 
  Wifi, 
  WifiOff,
  Plus,
  Edit3,
  Trash2,
  MoreVertical,
  FolderOpen,
  RefreshCw
} from 'lucide-react';
import ThreadSidebar from './ThreadSidebar';
import './ChatRoom.css';

const ChatRoom = ({ socket, user, onLogout, isConnected }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState('default');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [newThreadName, setNewThreadName] = useState('');
  const [editingThread, setEditingThread] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneratingId, setCurrentGeneratingId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleThreadsLoaded = (data) => {
      console.log('Received threads:', data);
      setThreads(data.threads || []);
      setError(null);
    };

    const handleMessagesLoaded = (data) => {
      console.log('Received messages:', data);
      setMessages(data.messages || []);
      if (data.activeThread) {
        setActiveThreadId(data.activeThread);
      }
    };

    const handleNewMessage = (message) => {
      console.log('Received new message:', message);
      setMessages(prev => [...prev, message]);
    };

    const handleUserJoined = (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        username: 'System',
        message: `${data.username} joined the chat`,
        timestamp: new Date().toISOString(),
        type: 'system'
      }]);
    };

    const handleError = (errorMessage) => {
      console.error('Socket error:', errorMessage);
      setError(errorMessage);
    };

    // Streaming handlers
    const handleAiMessageStart = (msg) => {
      console.log('AI message start:', msg);
      setMessages(prev => [...prev, { ...msg, message: '' }]);
      setIsGenerating(true);
      setCurrentGeneratingId(msg.id);
    };

    const handleAiMessageChunk = ({ messageId, content }) => {
      console.log('AI message chunk:', messageId, content);
      setMessages(prev =>
        prev.map((m) =>
          m.id === messageId ? { ...m, message: (m.message || '') + content } : m
        )
      );
    };

    const handleAiMessageDone = ({ messageId, content }) => {
      console.log('AI message done:', messageId, content);
      setMessages(prev =>
        prev.map((m) =>
          m.id === messageId ? { ...m, message: content, isStreaming: false } : m
        )
      );
      setIsGenerating(false);
      setCurrentGeneratingId(null);
    };

    const handleGenerationStopped = ({ messageId }) => {
      console.log('Generation stopped:', messageId);
      setMessages(prev =>
        prev.map((m) =>
          m.id === messageId ? { ...m, isStreaming: false } : m
        )
      );
      setIsGenerating(false);
      setCurrentGeneratingId(null);
    };

    socket.on('threads-loaded', handleThreadsLoaded);
    socket.on('messages-loaded', handleMessagesLoaded);
    socket.on('new-message', handleNewMessage);
    socket.on('user-joined', handleUserJoined);
    socket.on('error', handleError);
    socket.on('ai-message-start', handleAiMessageStart);
    socket.on('ai-message-chunk', handleAiMessageChunk);
    socket.on('ai-message-done', handleAiMessageDone);
    socket.on('generation-stopped', handleGenerationStopped);

    return () => {
      socket.off('threads-loaded', handleThreadsLoaded);
      socket.off('messages-loaded', handleMessagesLoaded);
      socket.off('new-message', handleNewMessage);
      socket.off('user-joined', handleUserJoined);
      socket.off('error', handleError);
      socket.off('ai-message-start', handleAiMessageStart);
      socket.off('ai-message-chunk', handleAiMessageChunk);
      socket.off('ai-message-done', handleAiMessageDone);
      socket.off('generation-stopped', handleGenerationStopped);
    };
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected) return;

    const messageData = {
      message: newMessage,
      threadId: activeThreadId || 'default'
    };

    socket.emit('send-message', messageData);
    setNewMessage('');
  };

  const handleCreateThread = () => {
    if (!newThreadName.trim()) return;
    
    socket.emit('create-thread', { threadName: newThreadName });
    setNewThreadName('');
    setShowCreateThread(false);
  };

  const handleSwitchThread = (thread) => {
    socket.emit('switch-thread', { threadId: thread.id });
    setActiveThreadId(thread.id);
  };

  const handleRenameThread = (threadId, newName) => {
    // Implement thread renaming
    console.log('Rename thread:', threadId, newName);
  };

  const handleDeleteThread = (threadId) => {
    // Implement thread deletion
    console.log('Delete thread:', threadId);
  };

  const handleRefreshThreads = () => {
    setIsLoading(true);
    // Trigger a refresh of threads
    socket.emit('join-chat', { username: user.username, apiKey: 'test-key' });
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleStopGeneration = () => {
    if (socket && currentGeneratingId) {
      socket.emit('stop-generation', { messageId: currentGeneratingId });
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to safely render message content
  const renderMessageContent = (message) => {
    if (typeof message === 'string') {
      // Convert markdown to HTML and render it
      return (
        <div 
          className="message-text"
          dangerouslySetInnerHTML={{ 
            __html: formatMessageContent(message) 
          }}
        />
      );
    }
    if (typeof message === 'object' && message !== null) {
      // If it's an object with a message property, extract it
      if (message.message !== undefined) {
        return (
          <div 
            className="message-text"
            dangerouslySetInnerHTML={{ 
              __html: formatMessageContent(String(message.message)) 
            }}
          />
        );
      }
      // If it's an object, stringify it for debugging
      return <div className="message-text">{JSON.stringify(message)}</div>;
    }
    // Fallback
    return <div className="message-text">{String(message || '')}</div>;
  };

  // Add this helper function to format message content
  const formatMessageContent = (text) => {
    if (!text) return '';
    
    // Convert markdown-like formatting to HTML
    let formatted = text
      // Convert code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // Convert inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Convert bold text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Convert italic text
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Convert line breaks
      .replace(/\n/g, '<br>')
      // Convert lists
      .replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>')
      // Convert numbered lists
      .replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>')
      // Wrap lists in ul/ol tags
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      // Convert headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Convert links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    return formatted;
  };

  // Add this function to get thread name
  const getThreadName = (threadId) => {
    if (threadId === 'default') {
      return 'General Chat';
    }
    
    const thread = threads.find(t => t.id === threadId);
    return thread ? thread.name : threadId;
  };

  return (
    <div className="chat-room">
      <ThreadSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSwitchThread={handleSwitchThread}
        onRenameThread={handleRenameThread}
        onDeleteThread={handleDeleteThread}
        onCreateThread={() => setShowCreateThread(true)}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
      />

      <div className={`chat-main ${showSidebar ? 'with-sidebar' : ''}`}>
        <div className="chat-header">
          <div className="header-left">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="sidebar-toggle"
            >
              <FolderOpen size={20} />
            </button>
            <div className="room-info">
              <h2>{getThreadName(activeThreadId)}</h2>
              <div className="room-stats">
                <span>{messages.length} messages</span>
                <span>{onlineUsers.length} online</span>
              </div>
            </div>
            <div className="connection-status">
              {isConnected ? (
                <span className="status connected">
                  <Wifi size={14} />
                  Connected
                </span>
              ) : (
                <span className="status disconnected">
                  <WifiOff size={14} />
                  Disconnected
                </span>
              )}
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={handleRefreshThreads}
              className="refresh-button"
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            </button>
            <span className="username">Welcome, {user.username}!</span>
            <button onClick={onLogout} className="logout-button">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-thread">
              <Sparkles size={48} />
              <p>Start a new conversation with CSIPL AI</p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.type} ${message.username === user.username ? 'own' : ''}`}
              >
                <div className="message-header">
                  <span className="message-username">{message.username}</span>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
                <div className="message-content">
                  {renderMessageContent(message.message)}
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="message ai typing">
              <div className="message-header">
                <span className="message-username">CSIPL AI</span>
              </div>
              <div className="message-content typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input">
          <div className="input-row">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={!isConnected || isGenerating}
            />
            {isGenerating ? (
              <button 
                type="button"
                onClick={handleStopGeneration}
                className="stop-button"
              >
                ⏹️ Stop
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={!newMessage.trim() || !isConnected}
                className="send-button"
              >
                <Send size={16} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Create Thread Modal */}
      {showCreateThread && (
        <div className="modal-overlay" onClick={() => setShowCreateThread(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Conversation</h3>
            <input
              type="text"
              value={newThreadName}
              onChange={(e) => setNewThreadName(e.target.value)}
              placeholder="Enter conversation name..."
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={() => setShowCreateThread(false)}>Cancel</button>
              <button onClick={handleCreateThread} disabled={!newThreadName.trim()}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom; 