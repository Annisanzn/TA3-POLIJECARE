const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:8000/api' : 'https://polijecare.my.id/backend/api');
export const STORAGE_BASE_URL = isLocalhost ? 'http://localhost:8000' : 'https://polijecare.my.id/backend';

export default {
    API_BASE_URL,
    STORAGE_BASE_URL
};
