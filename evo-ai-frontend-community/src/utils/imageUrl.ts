export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  
  if (url.startsWith('http')) {
    try {
      const urlObj = new URL(url);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      return `${baseUrl}${urlObj.pathname}${urlObj.search}`;
    } catch {
      return url;
    }
  }
  
  if (url.startsWith('/')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseUrl}${url}`;
  }
  
  return url;
};
