import { STORAGE_BASE_URL as PRODUCTION_STORAGE_BASE } from "../config";
/**
 * Normalizes image URLs from backend responses.
 * 
 * The Laravel backend generates image URLs using APP_URL, which on the production
 * server may still be set to http://127.0.0.1:8000. This utility rewrites those
 * localhost URLs to the correct production storage URL.
 */



/**
 * Fix image URL from backend — replaces localhost references with production URL.
 * @param {string|null} url - The image URL from the API response
 * @returns {string|null} - The corrected image URL, or null if input was falsy
 */
export function normalizeImageUrl(url) {
  if (!url) return null;

  // Replace any localhost/127.0.0.1 references with production URL
  return url
    .replace(/^https?:\/\/127\.0\.0\.1(:\d+)?/i, PRODUCTION_STORAGE_BASE)
    .replace(/^https?:\/\/localhost(:\d+)?/i, PRODUCTION_STORAGE_BASE);
}

/**
 * Build full storage URL from a relative path returned by the backend.
 * e.g. "complaint_attachments/file.pdf" → "https://api.polijecare.my.id/storage/complaint_attachments/file.pdf"
 * If the path is already a full URL, it will be normalized via normalizeImageUrl.
 * @param {string|null} path - Relative storage path or full URL
 * @returns {string|null}
 */
export function getStorageUrl(path) {
  if (!path) return null;

  // Already a full URL — just normalize it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return normalizeImageUrl(path);
  }

  // Relative path — prepend production API base with proxy route
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Use a proxy route if static storage access is forbidden (403)
  // Format: https://api.polijecare.my.id/api/files/download?path=relative/path
  return `${PRODUCTION_STORAGE_BASE}/api/files/view?path=${encodeURIComponent(cleanPath)}`;
}
