import React from 'react';
import { FiClock, FiUser, FiFileText, FiChevronRight } from 'react-icons/fi';

const ActivityList = () => {
  const activities = [
    {
      id: 'LP-2024-0012',
      title: 'Laporan Perundungan di Asrama Putra',
      reporter: 'Ahmad Fauzi',
      date: '18 Feb 2024 • 14:30',
      status: 'Baru',
      statusColor: 'bg-orange-100 text-orange-600',
    },
    {
      id: 'LP-2024-0011',
      title: 'Kekerasan Verbal di Kelas Teknik',
      reporter: 'Siti Rahma',
      date: '17 Feb 2024 • 10:15',
      status: 'Diproses',
      statusColor: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'LP-2024-0010',
      title: 'Penganiayaan Fisik di Lapangan',
      reporter: 'Budi Santoso',
      date: '16 Feb 2024 • 16:45',
      status: 'Selesai',
      statusColor: 'bg-green-100 text-green-600',
    },
    {
      id: 'LP-2024-0009',
      title: 'Bullying Online via Media Sosial',
      reporter: 'Dewi Anggraini',
      date: '15 Feb 2024 • 09:20',
      status: 'Diproses',
      statusColor: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'LP-2024-0008',
      title: 'Pelecehan Non-Fisik di Perpustakaan',
      reporter: 'Rizki Pratama',
      date: '14 Feb 2024 • 13:10',
      status: 'Baru',
      statusColor: 'bg-orange-100 text-orange-600',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Baru':
        return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>;
      case 'Diproses':
        return <div className="w-2 h-2 bg-purple-500 rounded-full"></div>;
      case 'Selesai':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
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
          <button className="text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-2">
            <span>Lihat Semua</span>
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(activity.status)}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{activity.title}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <FiFileText className="w-4 h-4" />
                        <span>ID: {activity.id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiUser className="w-4 h-4" />
                        <span>{activity.reporter}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiClock className="w-4 h-4" />
                        <span>{activity.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${activity.statusColor}`}>
                  {activity.status}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total laporan aktif:</span> 12 laporan membutuhkan tindakan
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              Filter Laporan
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors">
              Tindakan Cepat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityList;