/**
 * Trigger direct file download for resident documents and Aadhaar images
 */
export const downloadAadhaarFile = async (url?: string, filename?: string) => {
  if (!url) return;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'Aadhaar_Card_Document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.warn('Fallback direct download:', err);
    window.open(url, '_blank');
  }
};
