import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { sendChatMessage, uploadDocument, getStatus } from './services/api';
import { Menu } from 'lucide-react';

function App() {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('studyMateSessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const saved = localStorage.getItem('studyMateActiveSession');
    return saved ? JSON.parse(saved) : null;
  });
  
  // We'll compute the active messages from sessions state
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  const [documents, setDocuments] = useState([]);
  const [useRag, setUseRag] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modelReady, setModelReady] = useState(null); // null = unknown, true/false
  const [statusMsg, setStatusMsg] = useState(null); // { text, type: 'success'|'error'|'info' }

  // Save to localStorage whenever sessions or activeSessionId changes
  useEffect(() => {
    localStorage.setItem('studyMateSessions', JSON.stringify(sessions));
    localStorage.setItem('studyMateActiveSession', JSON.stringify(activeSessionId));
  }, [sessions, activeSessionId]);

  const handleNewChat = () => {
    setActiveSessionId(null);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleSelectSession = (id) => {
    setActiveSessionId(id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleDeleteSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  // Close sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Poll model readiness on mount and until ready
  const checkModelStatus = useCallback(async () => {
    const data = await getStatus();
    setModelReady(data.modelReady);
    return data.modelReady;
  }, []);

  useEffect(() => {
    let interval;
    const poll = async () => {
      const ready = await checkModelStatus();
      if (ready) {
        clearInterval(interval);
      }
    };
    poll();
    // Check every 5s until ready
    interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [checkModelStatus]);

  // Auto-dismiss status messages after 4 seconds
  useEffect(() => {
    if (!statusMsg) return;
    const timer = setTimeout(() => setStatusMsg(null), 4000);
    return () => clearTimeout(timer);
  }, [statusMsg]);

  const showStatus = (text, type = 'info') => setStatusMsg({ text, type });

  const handleSendMessage = async (text, imageFile) => {
    let imageUrl = null;
    if (imageFile) {
      imageUrl = URL.createObjectURL(imageFile);
    }
    
    const newUserMessage = { role: 'user', content: text, imageUrl };
    
    let currentSessionId = activeSessionId;
    let currentMessages = [...messages, newUserMessage];
    let isNewSession = !currentSessionId;

    if (isNewSession) {
      currentSessionId = Date.now().toString();
      setActiveSessionId(currentSessionId);
      setSessions(prev => [
        { id: currentSessionId, title: text.slice(0, 30) + (text.length > 30 ? '...' : ''), messages: currentMessages },
        ...prev
      ]);
    } else {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, messages: currentMessages } : s
      ));
    }
    
    setIsChatLoading(true);

    try {
      // Send history (excluding the very new message we just added) to the API
      // so the AI has context
      const historyToPass = messages.map(m => ({ role: m.role, content: m.content }));
      
      const data = await sendChatMessage(text, imageFile, useRag, historyToPass);
      
      const newAiMessage = {
        role: 'ai',
        content: data.answer,
        sources: data.sources,
        toolUsed: data.toolUsed
      };
      
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, messages: [...s.messages, newAiMessage] } : s
      ));
    } catch (error) {
      console.error(error);
      const errorMsg = {
        role: 'ai',
        content: `**Error:** ${error.message}`
      };
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s
      ));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleUploadDocument = async (file) => {
    if (modelReady === false) {
      showStatus('⏳ The AI model is still loading. Please wait a few seconds and try again.', 'error');
      return;
    }

    setIsUploading(true);
    showStatus(`📄 Uploading "${file.name}"…`, 'info');

    try {
      const data = await uploadDocument(file);
      setDocuments(prev => [...prev, data.document]);
      showStatus(`✅ "${data.document}" indexed (${data.chunks} chunks). You can now ask questions about it!`, 'success');
    } catch (error) {
      showStatus(`❌ Upload failed: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}
      
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar 
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          documents={documents} 
          useRag={useRag} 
          setUseRag={setUseRag} 
          onClose={() => setIsSidebarOpen(false)}
          modelReady={modelReady}
        />
      </div>
      
      <main className="main-chat">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button className="icon-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="mobile-header-logo">
            <img src="/logo.jpg" alt="StudyMate AI" />
            <span>StudyMate AI</span>
          </div>
          <div style={{ width: 40 }}></div> {/* Spacer */}
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div className={`status-toast status-toast--${statusMsg.type}`}>
            {statusMsg.text}
          </div>
        )}

        {/* Model loading banner */}
        {modelReady === false && (
          <div className="model-loading-banner">
            ⚙️ AI model is initializing… Document uploads will be available shortly.
          </div>
        )}
        
        <ChatWindow messages={messages} />
        <ChatInput 
          onSendMessage={handleSendMessage} 
          onUploadDocument={handleUploadDocument}
          isLoading={isChatLoading}
          isUploading={isUploading}
          modelReady={modelReady}
        />
      </main>
    </div>
  );
}

export default App;
