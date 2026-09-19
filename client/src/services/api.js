const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getStatus = async () => {
  try {
    const response = await fetch(`${API_BASE}/status`);
    if (!response.ok) return { modelReady: true }; // Assume ready if status endpoint fails
    return response.json();
  } catch {
    return { modelReady: true }; // Fail open so the UI isn't blocked
  }
};

export const sendChatMessage = async (text, imageFile, useRag, history = []) => {
  const formData = new FormData();
  if (text) formData.append('text', text);
  if (imageFile) formData.append('image', imageFile);
  formData.append('useRag', useRag ? 'true' : 'false');
  if (history && history.length > 0) formData.append('history', JSON.stringify(history));

  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send message');
  }

  return response.json();
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload document');
  }

  return response.json();
};
