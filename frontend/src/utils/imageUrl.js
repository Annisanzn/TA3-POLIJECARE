import { STORAGE_BASE_URL as PRODUCTION_STORAGE_BASE } from "../config";
/**
 * Normalizes image URLs from backend responses.
 *
 * Handles multiple cases:
 * 1. localhost/127.0.0.1 URLs → replace with production API URL
 * 2. Direct /storage/ URLs (from old code or proxy issues) → convert to FileController proxy
 * 3. Already correct /api/files/view URLs → return as-is
 * 4. Relative paths → build FileController proxy URL
 */

const API_URL = `${PRODUCTION_STORAGE_BASE}/api/files/view?path=`;

/**
 * Fix image URL from backend — handles all production URL formats.
 * @param {string|null} url - The image URL from the API response
 * @returns {string|null} - The corrected image URL, or null if input was falsy
 */
export function normalizeImageUrl(url) {
  if (!url) return null;

  // 1. Replace localhost/127.0.0.1 with production API base
  let normalized = url
    .replace(/^https?:\/\/127\.0\.0\.1(:\d+)?\/api\//i, `${PRODUCTION_STORAGE_BASE}/api/`)
    .replace(/^https?:\/\/127\.0\.0\.1(:\d+)?\//i, `${PRODUCTION_STORAGE_BASE}/`)
    .replace(/^https?:\/\/localhost(:\d+)?\/api\//i, `${PRODUCTION_STORAGE_BASE}/api/`)
    .replace(/^https?:\/\/localhost(:\d+)?\//i, `${PRODUCTION_STORAGE_BASE}/`);

  // 1b. Replace api.polijecare.my.id subdomain with polijecare.my.id (production proxy)
  //     Backend APP_URL = api.polijecare.my.id, but real API is at polijecare.my.id/api
  normalized = normalized.replace(
    /^https?:\/\/api\.polijecare\.my\.id\//i,
    `${PRODUCTION_STORAGE_BASE}/`
  );

  // 2. If URL already uses FileController proxy → return as-is
  if (normalized.includes('/api/files/view')) {
    return normalized;
  }

  // 3. Convert direct /storage/articles/... or /api/storage/articles/... → FileController proxy
  // e.g. https://api.polijecare.my.id/storage/articles/file.png
  //   or https://polijecare.my.id/api/storage/articles/file.png
  const storageMatch = normalized.match(/\/storage\/(.+)$/);
  if (storageMatch) {
    return `${API_URL}${storageMatch[1]}`;
  }

  // 4. If it's a relative path (no http prefix) → build FileController URL
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    const cleanPath = normalized.startsWith('/') ? normalized.slice(1) : normalized;
    return `${API_URL}${encodeURIComponent(cleanPath)}`;
  }

  return normalized;
}

/**
 * Build full storage URL from a relative path returned by the backend.
 * e.g. "complaint_attachments/file.pdf" → FileController proxy URL
 * If the path is already a full URL, it will be normalized via normalizeImageUrl.
 * @param {string|null} path - Relative storage path or full URL
 * @returns {string|null}
 */
export function getStorageUrl(path) {
  if (!path) return null;

  // Already a full URL — normalize it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return normalizeImageUrl(path);
  }

  // Relative path — use FileController proxy
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_URL}${encodeURIComponent(cleanPath)}`;
}

