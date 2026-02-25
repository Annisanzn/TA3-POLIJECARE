// Konselor-specific complaint service
// Hits /konselor/* endpoints — data already filtered by counselor_id on the backend
import axios from '../api/axios';

export const konselorComplaintService = {
    getComplaints: async (params = {}) => {
        const response = await axios.get('/konselor/pengaduan', { params });
        return response;
    },

    updateStatus: async (id, status) => {
        // Reuse operator endpoint for status update (konselor has permission via role check on backend)
        const response = await axios.patch(`/operator/complaints/${id}/status`, { status });
        return response;
    },

    schedule: async (id, payload) => {
        const response = await axios.patch(`/operator/complaints/${id}/schedule`, payload);
        return response;
    },
};
