import React from 'react';
import { PlusCircle, FileText, Database, X, Cpu, MessageSquare, Trash2 } from 'lucide-react';

const Sidebar = ({ 
  sessions = [], 
  activeSessionId, 
  onNewChat, 
  onSelectSession, 
  onDeleteSession, 
  documents, 
  useRag, 
  setUseRag, 
  onClose, 
  modelReady 
}) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/logo.jpg" alt="StudyMate AI Logo" className="logo-img" />
          <span className="logo-text">StudyMate AI</span>
        </div>
        <button className="mobile-close-btn icon-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <button className="new-chat-btn" onClick={onNewChat}>
        <PlusCircle size={18} />
        New Chat
      </button>

      {modelReady === false && (
        <div className="model-status-badge">
          <Cpu size={14} />
          <span>AI Model Loading…</span>
        </div>
      )}
      {modelReady === true && (
        <div className="model-status-badge model-status-badge--ready">
          <Cpu size={14} />
          <span>AI Model Ready</span>
        </div>
      )}
      
      <div className="sessions-section">
        <h3>Chat History</h3>
        <div className="sessions-list">
          {sessions.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No previous chats.</p>
          ) : (
            sessions.map(session => (
              <div 
                key={session.id} 
                className={`session-item ${session.id === activeSessionId ? 'active' : ''}`}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="session-title-wrapper">
                  <MessageSquare size={16} />
                  <span className="session-title">{session.title || 'New Chat'}</span>
                </div>
                <button 
                  className="delete-session-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  title="Delete Chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="documents-section">
        <h3>Knowledge Base</h3>
        {documents.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No documents uploaded yet.</p>
        ) : (
          documents.map((doc, idx) => (
            <div key={idx} className="document-item">
              <FileText size={16} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {doc}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="rag-toggle">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={useRag}
            onChange={(e) => setUseRag(e.target.checked)}
          />
          <Database size={16} />
          Enable RAG
        </label>
      </div>
    </div>
  );
};

export default Sidebar;
