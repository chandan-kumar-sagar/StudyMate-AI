import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const CHIPS = [
  '📄 Upload a PDF to study',
  '🖼️ Analyze an image',
  '💡 Explain a concept',
  '📝 Summarize notes',
];

const ChatWindow = ({ messages }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-history">
      {messages.length === 0 ? (
        <div className="empty-state">
          <img src="/logo.jpg" alt="StudyMate AI" className="empty-state-icon" />
          <h2>Welcome to StudyMate AI</h2>
          <p>
            Your intelligent study companion. Ask any question, upload documents for
            RAG-powered answers, or share an image to analyze.
          </p>
          <div className="empty-state-chips">
            {CHIPS.map((chip) => (
              <span key={chip} className="empty-state-chip">{chip}</span>
            ))}
          </div>
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
