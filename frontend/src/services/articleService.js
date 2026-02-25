import api from '../api/axios';

const BASE = '/articles';
const ADMIN = '/operator/admin/articles';

export const articleService = {
  // ─── PUBLIC (Landing Page) ────────────────────────────────────────────────

  /** Ambil artikel publik aktif (max 6) */
  getAll: async () => {
    const response = await api.get(BASE);
    return response.data;
  },

  /** Ambil detail artikel publik by slug */
  getBySlug: async (slug) => {
    const response = await api.get(`${BASE}/${slug}`);
    return response.data;
  },

  // ─── ADMIN / OPERATOR ─────────────────────────────────────────────────────

  admin: {
    /** Daftar semua artikel (paginated, filterable) */
    getAll: async (params = {}) => {
      const response = await api.get(ADMIN, { params });
      return response.data;
    },

    /** Buat artikel baru (FormData untuk upload gambar) */
    create: async (formData) => {
      const response = await api.post(ADMIN, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },

    /** Update artikel (FormData untuk upload gambar baru) */
    update: async (id, formData) => {
      const response = await api.post(`${ADMIN}/${id}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },

    /** Hapus artikel */
    delete: async (id) => {
      const response = await api.delete(`${ADMIN}/${id}`);
      return response.data;
    },

    /** Toggle is_active */
    toggle: async (id) => {
      const response = await api.patch(`${ADMIN}/${id}/toggle`);
      return response.data;
    },
  },
};
