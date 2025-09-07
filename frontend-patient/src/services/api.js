
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = async (path, { method = 'GET', body, headers } = {}) => {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Request failed: ${res.status}`);
    }

    const data = res.status === 204 ? null : await res.json();
    console.log('API response:', data);
    return data;
  } catch (err) {
    console.log('API error:', err);
    throw err;
  }
};

export { api };