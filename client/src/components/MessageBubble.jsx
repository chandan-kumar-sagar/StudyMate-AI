import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Search } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'ai'}`}>
      <div className="message-bubble">
        {/* Render Image if exists in user message */}
        {isUser && message.imageUrl && (
          <img src={message.imageUrl} alt="Uploaded attachment" className="message-image" />
        )}

        {/* Tool Indicator */}
        {!isUser && message.toolUsed && (
          <div className="tool-badge">
            <Search size={14} />
            Tool Used: {message.toolUsed}
          </div>
        )}

        {/* Text Content */}
        {isUser ? (
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
        ) : (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        )}

        {/* Sources for RAG */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="sources-box">
            <h4>Sources:</h4>
            <ul>
              {message.sources.map((src, idx) => (
                <li key={idx}>
                  {src.document} {src.page ? `(Page ${src.page})` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
