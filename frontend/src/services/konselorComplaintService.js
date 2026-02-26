// Konselor-specific complaint service
// Hits /konselor/* endpoints — data already filtered by counselor_id on the backend
import axios from '../api/axios';

export const konselorComplaintService = {
    getComplaints: async (params = {}) => {
        const response = await axios.get('/konselor/pengaduan', { params });
        return response;
    },

    updateStatus: async (id, status) => {
        const response = await axios.patch(`/konselor/complaints/${id}/status`, { status });
        return response;
    },

    schedule: async (id, payload) => {
        const response = await axios.patch(`/konselor/complaints/${id}/schedule`, payload);
        return response;
    },
};
