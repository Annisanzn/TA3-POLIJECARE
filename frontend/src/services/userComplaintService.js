import axios from '../api/axios';

const userComplaintService = {
    /**
     * Mengambil daftar laporan pengaduan mahasiswa.
     * @param {Object} params - Query parameters (page, per_page, dll)
     */
    getHistoriPengaduan: async (params = {}) => {
        try {
            const response = await axios.get('/user/complaints', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Mengambil detail spesifik dari laporan pengaduan mahasiswa.
     * @param {number|string} id - ID laporan
     */
    getDetailPengaduan: async (id) => {
        try {
            const response = await axios.get(`/user/complaints/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Mengirimkan data laporan pengaduan baru dari mahasiswa.
     * @param {Object} data - Form data pengaduan
     */
    createPengaduan: async (data) => {
        try {
            const response = await axios.post('/user/complaints', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default userComplaintService;
