// Utility to get the full image URL based on a configurable base
export const getImageUrl = (path) => {
  const baseUrl = window.BASE_URL || process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:5265';
  if (!path) return baseUrl + '/placeholder.png';
  // If path already contains http(s), return as is
  if (/^https?:\/\//.test(path)) return path;
  return baseUrl + path;
};
