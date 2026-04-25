const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:8000/api' : 'https://api.polijecare.my.id/api');
export const STORAGE_BASE_URL = isLocalhost ? 'http://localhost:8000' : 'https://api.polijecare.my.id';

export default {
    API_BASE_URL,
    STORAGE_BASE_URL
};
