import axios from '../api/axios';

const counselingService = {
  // Get all counseling schedules (role-based) - for operator use operator prefix
  async getSchedules(params = {}) {
    // Use test endpoint for development without auth
    if (process.env.NODE_ENV === 'development' && params.test === true) {
      const response = await axios.get('/counseling-test', { params });
      return response.data;
    }
    
    // For operator, use operator/counseling endpoint
    const endpoint = '/operator/counseling';
    const response = await axios.get(endpoint, { params });
    return response.data;
  },

  // Get available counselors - accessible by all authenticated users
  async getCounselors() {
    const response = await axios.get('/counseling/counselors');
    return response.data;
  },

  // Get available time slots for a counselor on a specific date
  async getAvailableSlots(counselorId, tanggal) {
    const response = await axios.get('/counseling/available-slots', {
      params: { counselor_id: counselorId, tanggal }
    });
    return response.data;
  },

  // Request a new counseling schedule (user only)
  async requestSchedule(scheduleData) {
    const response = await axios.post('/counseling/request', scheduleData);
    return response.data;
  },

  // Approve a counseling schedule (counselor/operator only)
  async approveSchedule(id) {
    // Try operator endpoint first, then general counseling endpoint
    try {
      const response = await axios.put(`/operator/counseling/${id}/approve`);
      return response.data;
    } catch (error) {
      // Fallback to general endpoint
      const response = await axios.put(`/counseling/${id}/approve`);
      return response.data;
    }
  },

  // Reject a counseling schedule (counselor/operator only)
  async rejectSchedule(id, rejectionReason) {
    // Try operator endpoint first, then general counseling endpoint
    try {
      const response = await axios.put(`/operator/counseling/${id}/reject`, {
        rejection_reason: rejectionReason
      });
      return response.data;
    } catch (error) {
      // Fallback to general endpoint
      const response = await axios.put(`/counseling/${id}/reject`, {
        rejection_reason: rejectionReason
      });
      return response.data;
    }
  },

  // Update schedule status (operator only)
  async updateScheduleStatus(id, status) {
    // Operator endpoint for status update
    const response = await axios.put(`/operator/counseling/${id}/status`, { status });
    return response.data;
  },

  // Get statistics - accessible by all authenticated users
  async getStatistics() {
    const response = await axios.get('/counseling/statistics');
    return response.data;
  },

  // Get status badge color
  getStatusColor(status) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Get status display text
  getStatusDisplay(status) {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  },

  // Get method badge color
  getMethodColor(method) {
    switch (method) {
      case 'online':
        return 'bg-purple-100 text-purple-800';
      case 'offline':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Get method display text
  getMethodDisplay(method) {
    switch (method) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      default:
        return method;
    }
  },

  // Format date for display
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Format time for display
  formatTime(timeString) {
    return timeString.substring(0, 5); // Convert "09:00:00" to "09:00"
  },

  // Generate meeting link (for online sessions)
  generateMeetingLink() {
    const randomId = Math.random().toString(36).substring(2, 15);
    return `https://meet.polijecare.ac.id/${randomId}`;
  }
};

export default counselingService;