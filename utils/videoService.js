// Utility functions for video URL handling

// Extract YouTube video ID from various URL formats
const extractYoutubeId = (url) => {
  if (!url) return null;
  
  // Match different YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};

// Convert YouTube URL to embed URL
const getEmbedUrl = (url) => {
  const videoId = extractYoutubeId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0`;
};

// Validate YouTube URL
const isValidYoutubeUrl = (url) => {
  if (!url) return false;
  return extractYoutubeId(url) !== null;
};

module.exports = {
  extractYoutubeId,
  getEmbedUrl,
  isValidYoutubeUrl
};
