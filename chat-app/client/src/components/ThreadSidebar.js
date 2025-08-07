import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  MoreVertical,
  MessageSquare,
  Clock
} from 'lucide-react';
import './ThreadSidebar.css';

const ThreadSidebar = ({ 
  threads, 
  activeThreadId, 
  onSwitchThread, 
  onRenameThread, 
  onDeleteThread, 
  onCreateThread,
  showSidebar,
  onToggleSidebar
}) => {
  const [editingThread, setEditingThread] = useState(null);
  const [editName, setEditName] = useState('');

  const handleEditClick = (thread) => {
    setEditingThread(thread.id);
    setEditName(thread.name);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onRenameThread(editingThread, editName.trim());
      setEditingThread(null);
      setEditName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingThread(null);
    setEditName('');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={`thread-sidebar ${showSidebar ? 'show' : ''}`}>
      <div className="sidebar-header">
        <h3>Conversations</h3>
        <button className="new-thread-btn" onClick={onCreateThread}>
          <Plus size={16} />
          New
        </button>
      </div>

      <div className="thread-list">
        {threads.length === 0 ? (
          <div className="no-threads">
            <MessageSquare size={32} />
            <p>No conversations yet</p>
            <button onClick={onCreateThread} className="create-first-thread">
              Create your first conversation
            </button>
          </div>
        ) : (
          threads.map((thread) => (
            <div 
              key={thread.id}
              className={`thread-item ${thread.id === activeThreadId ? 'active' : ''}`}
              onClick={() => onSwitchThread(thread)}
            >
              <div className="thread-content">
                {editingThread === thread.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                    onBlur={handleSaveEdit}
                    autoFocus
                    className="edit-thread-name"
                  />
                ) : (
                  <div className="thread-info">
                    <span className="thread-name">{thread.name}</span>
                    <span className="thread-date">
                      <Clock size={12} />
                      {formatDate(thread.lastActivity)}
                    </span>
                  </div>
                )}
              </div>
              
              {thread.id === activeThreadId && editingThread !== thread.id && (
                <div className="thread-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(thread);
                    }}
                    className="action-btn edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteThread(thread.id);
                    }}
                    className="action-btn delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ThreadSidebar; 