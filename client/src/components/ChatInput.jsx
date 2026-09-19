import React, { useRef, useState } from 'react';
import { Image, FileText, Send, X, Loader } from 'lucide-react';

const ChatInput = ({ onSendMessage, onUploadDocument, isLoading, isUploading, modelReady }) => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;
    
    onSendMessage(text, imageFile);
    setText('');
    setImageFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleDocChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUploadDocument(e.target.files[0]);
    }
    // reset input so same file can be uploaded again if needed
    e.target.value = '';
  };

  // The upload button is disabled while uploading OR while the model isn't ready
  const uploadDisabled = isUploading || modelReady === false;

  return (
    <div className="input-area">
      <form onSubmit={handleSubmit} className="input-container">
        
        {imageFile && (
          <div className="preview-badge">
            <Image size={14} />
            {imageFile.name}
            <button type="button" onClick={() => setImageFile(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {isUploading && (
          <div className="preview-badge preview-badge--uploading">
            <Loader size={14} className="spin" />
            Indexing document…
          </div>
        )}

        <textarea
          placeholder="Ask StudyMate AI..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
        />
        
        <div className="input-actions">
          <div className="attachment-buttons">
            <button 
              type="button" 
              className="icon-btn" 
              title="Attach Image"
              onClick={() => imageInputRef.current?.click()}
              disabled={isLoading}
            >
              <Image size={20} />
            </button>
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp" 
              ref={imageInputRef} 
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />

            <button 
              type="button" 
              className="icon-btn" 
              title={
                modelReady === false
                  ? 'AI model is loading, please wait…'
                  : isUploading
                  ? 'Uploading…'
                  : 'Upload Document for RAG'
              }
              onClick={() => !uploadDisabled && docInputRef.current?.click()}
              disabled={uploadDisabled}
              style={{ opacity: uploadDisabled ? 0.5 : 1 }}
            >
              {isUploading ? <Loader size={20} className="spin" /> : <FileText size={20} />}
            </button>
            <input 
              type="file" 
              accept="application/pdf, text/plain" 
              ref={docInputRef} 
              style={{ display: 'none' }}
              onChange={handleDocChange}
            />
          </div>

          <button 
            type="submit" 
            className="send-btn"
            disabled={isLoading || (!text.trim() && !imageFile)}
          >
            {isLoading ? 'Thinking...' : (
              <>Send <Send size={16} /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
