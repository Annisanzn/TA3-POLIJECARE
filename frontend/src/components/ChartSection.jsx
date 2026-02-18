import React, { useState } from 'react';
import { FiBarChart2, FiPieChart } from 'react-icons/fi';

const ChartSection = () => {
  const [activeYear, setActiveYear] = useState('2024');

  const years = ['Semua', '2023', '2024', '2025'];

  // Data untuk kategori kekerasan
  const categoryData = [
    { name: 'Perundungan', value: 45, color: 'bg-purple-600', percentage: '45%' },
    { name: 'Verbal', value: 30, color: 'bg-purple-400', percentage: '30%' },
    { name: 'Fisik', value: 15, color: 'bg-green-500', percentage: '15%' },
    { name: 'Non-Fisik', value: 10, color: 'bg-orange-400', percentage: '10%' },
  ];

  // Data untuk distribusi gender
  const genderData = [
    { month: 'Jan', laki: 65, perempuan: 35 },
    { month: 'Feb', laki: 70, perempuan: 30 },
    { month: 'Mar', laki: 55, perempuan: 45 },
    { month: 'Apr', laki: 60, perempuan: 40 },
    { month: 'Mei', laki: 75, perempuan: 25 },
    { month: 'Jun', laki: 50, perempuan: 50 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Sebaran Kekerasan per Kategori */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <FiPieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Sebaran Kekerasan per Kategori</h3>
              <p className="text-sm text-gray-500">Distribusi jenis laporan kekerasan</p>
            </div>
          </div>
          <div className="flex bg-gray-100 rounded-full p-1">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                  activeYear === year
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {categoryData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">{item.percentage}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${item.color}`}
                  style={{ width: item.percentage }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{item.value} laporan</span>
                <span>{item.percentage} dari total</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total laporan: 100 kasus</span>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              Lihat detail →
            </button>
          </div>
        </div>
      </div>

      {/* Chart 2: Distribusi Gender Pelapor */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <FiBarChart2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Distribusi Gender Pelapor</h3>
              <p className="text-sm text-gray-500">Perbandingan laki-laki vs perempuan</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
              <span className="text-sm text-gray-600">Laki-laki</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#C084FC]"></div>
              <span className="text-sm text-gray-600">Perempuan</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {genderData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{item.month}</span>
                <span>Total: {item.laki + item.perempuan} laporan</span>
              </div>
              <div className="flex h-8 rounded-lg overflow-hidden">
                <div
                  className="bg-[#8B5CF6] transition-all duration-500"
                  style={{ width: `${item.laki}%` }}
                  title={`Laki-laki: ${item.laki}%`}
                >
                  <div className="h-full flex items-center justify-end pr-2">
                    <span className="text-white text-xs font-medium">{item.laki}%</span>
                  </div>
                </div>
                <div
                  className="bg-[#C084FC] transition-all duration-500"
                  style={{ width: `${item.perempuan}%` }}
                  title={`Perempuan: ${item.perempuan}%`}
                >
                  <div className="h-full flex items-center pl-2">
                    <span className="text-white text-xs font-medium">{item.perempuan}%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Laki: {item.laki}%</span>
                <span>Perempuan: {item.perempuan}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Rata-rata: 62% Laki-laki, 38% Perempuan
            </div>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              Ekspor data →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;