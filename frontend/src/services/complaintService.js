import axios from '../api/axios';

export const complaintService = {
  getComplaints: async (params = {}) => {
    const response = await axios.get('/operator/complaints', {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        search: params.search ?? '',
        status: params.status ?? 'all',
        urgency: params.urgency ?? 'all',
        date_from: params.date_from ?? '',
        date_to: params.date_to ?? '',
      },
    });

    return response;
  },

  getComplaintById: async (id) => {
    const response = await axios.get(`/operator/complaints/${id}`);
    return response;
  },

  getComplaintStats: async () => {
    const response = await axios.get('/operator/complaints-stats');
    return response;
  },

  updateStatus: async (id, status) => {
    const response = await axios.patch(`/operator/complaints/${id}/status`, { status });
    return response;
  },

  schedule: async (id, payload) => {
    const response = await axios.patch(`/operator/complaints/${id}/schedule`, payload);
    return response;
  },
};
