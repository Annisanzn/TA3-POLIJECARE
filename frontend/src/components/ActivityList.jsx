import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiUser, FiFileText, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import axios from '../api/axios';

const ActivityList = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [totalActive, setTotalActive] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = user.role === 'konselor' ? '/konselor/complaints' : '/operator/complaints';
      const response = await axios.get(endpoint, {
        params: { page: 1, per_page: 5, status: 'pending,approved' }
      });
      
      if (response.data && response.data.data) {
        setActivities(response.data.data);
        setTotalActive(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Gagal memuat aktivitas. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);
  const navigate = useNavigate();
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Baru';
      case 'approved': return 'Diproses';
      case 'completed': return 'Selesai';
      case 'rejected': return 'Ditolak';
      default: return 'Baru';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-600';
      case 'approved': return 'bg-purple-100 text-purple-600';
      case 'completed': return 'bg-green-100 text-green-600';
      case 'rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>;
      case 'approved':
        return <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>;
      case 'completed':
        return <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>;
      case 'rejected':
        return <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', ' •').replace(/\./g, ':') + ' WIB';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <FiClock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Aktivitas Terbaru</h3>
              <p className="text-sm text-gray-500">5 laporan terbaru yang perlu perhatian</p>
            </div>
          </div>
          <button 
            onClick={() => navigate(user?.role === 'konselor' ? '/konselor/case-management' : '/operator/complaints-management')}
            className="text-[#6666DE] hover:text-[#5555CC] font-medium flex items-center space-x-2 transition-colors"
          >
            <span>Lihat Semua</span>
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Memuat aktivitas...</div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500 text-sm mb-2">{error}</p>
            <button 
              onClick={fetchActivities}
              className="text-sm text-[#6666DE] hover:text-[#5555CC] font-medium transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Tidak ada aktivitas terbaru</div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => navigate(user?.role === 'konselor' ? `/konselor/complaint-detail/${activity.id}` : `/operator/complaint-detail/${activity.id}`)}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{activity.title}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <FiFileText className="w-4 h-4 flex-shrink-0" />
                          <span>ID: {activity.report_id}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiUser className="w-4 h-4 flex-shrink-0" />
                          <span>{activity.user_name || 'Anonim'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiClock className="w-4 h-4 flex-shrink-0" />
                          <span>{formatDate(activity.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(activity.status)}`}>
                    {getStatusLabel(activity.status)}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors group-hover:text-[#6666DE]">
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total laporan aktif:</span> {totalActive} laporan membutuhkan tindakan
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityList;