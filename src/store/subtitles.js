// src/store/subtitles.js

export async function loadSubtitles(videoId) {
  // 1. Check localStorage first (local edits / Vercel persistence fallback)
  try {
    const cached = localStorage.getItem(`mentora_subtitles_${videoId}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("Failed to read subtitles from localStorage:", e);
  }

  // 2. Fallback to public directory JSON file
  try {
    const response = await fetch(`/subtitles/${videoId}.json?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch from server');
    }
    // Verify it is actual JSON and not SPA HTML index fallback
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error('SPA redirect HTML fallback');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn(`No static subtitles found for video ${videoId}, initializing empty list:`, err.message);
    return [];
  }
}

export async function saveSubtitles(videoId, subtitles) {
  // 1. Always save to localStorage first (instant local persistence)
  try {
    localStorage.setItem(`mentora_subtitles_${videoId}`, JSON.stringify(subtitles));
  } catch (e) {
    console.warn("Failed to write subtitles to localStorage:", e);
  }

  // 2. Push to server to save on disk if writable (e.g., local dev)
  try {
    const response = await fetch('/api/save-subtitles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId, subtitles }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to save subtitles');
    }
    return await response.json();
  } catch (err) {
    console.warn("Server save failed (expected on read-only environments like Vercel):", err.message);
    return { success: true, warning: 'Saved locally in browser only.' };
  }
}

