import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ messages }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-history">
      {messages.length === 0 ? (
        <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <h2>Welcome to StudyMate AI</h2>
          <p style={{ marginTop: '0.5rem' }}>Ask a question, upload a document for RAG, or upload an image to analyze.</p>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
