import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiPieChart, FiUsers, FiX, FiMap } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

// Komponen Donut Chart sederhana
const DonutChart = ({ data, size = 160, strokeWidth = 20 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, index) => {
          const percent = (item.value / total) * 100;
          const strokeDasharray = `${percent} ${100 - percent}`;
          const rotation = cumulativePercent * 3.6;
          cumulativePercent += percent;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - strokeWidth / 2}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset="25"
              transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              className="transition-all duration-500"
            />
          );
        })}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          className="text-2xl font-bold fill-gray-800"
        >
          {total}
        </text>
        <text
          x="50%"
          y="60%"
          textAnchor="middle"
          className="text-sm fill-gray-500"
        >
          Total
        </text>
      </svg>

      {/* Legend */}
      <div className="absolute -right-40 top-0 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color.replace('bg-', '') }}
            ></div>
            <span className="text-sm text-gray-700">{item.name}</span>
            <span className="text-sm font-medium text-gray-900">{item.percentage}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CHART_COLORS = ['#7C3AED', '#A78BFA', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6'];

const ChartSection = () => {
  const [activeYear, setActiveYear] = useState('2024');
  const [showMapModal, setShowMapModal] = useState(false);
  const { user } = useAuth();

  // Dynamic state for category distribution chart
  const [categoryData, setCategoryData] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(true);

  const years = ['Semua', '2023', '2024', '2025'];

  // Fetch category distribution data from API
  useEffect(() => {
    const fetchCategoryDistribution = async () => {
      if (!user?.role) return;
      try {
        setLoadingCategory(true);
        // Determine API prefix based on user role
        const rolePrefix = user?.role === 'konselor' ? '/konselor' : '/operator';
        const res = await api.get(`${rolePrefix}/dashboard/report-category-distribution`);

        if (res.data?.success && Array.isArray(res.data.data)) {
          const total = res.data.data.reduce((sum, item) => sum + item.jumlah, 0);
          const transformed = res.data.data.map((item, index) => {
            const pct = total > 0 ? ((item.jumlah / total) * 100).toFixed(0) : 0;
            return {
              name: item.kategori,
              value: total > 0 ? Math.round((item.jumlah / total) * 100) : 0,
              rawCount: item.jumlah,
              color: CHART_COLORS[index % CHART_COLORS.length],
              percentage: `${pct}%`,
              hexColor: CHART_COLORS[index % CHART_COLORS.length],
            };
          });
          setCategoryData(transformed);
        }
      } catch (error) {
        console.error('Failed to fetch category distribution', error);
        setCategoryData([]);
      } finally {
        setLoadingCategory(false);
      }
    };

    fetchCategoryDistribution();
  }, [user?.role]);

  // Compute dynamic totals
  const totalReports = categoryData.reduce((sum, item) => sum + (item.rawCount || 0), 0);
  const highestCategory = categoryData.length > 0 ? categoryData.reduce((max, item) => item.rawCount > max.rawCount ? item : max, categoryData[0]) : null;

  // Data untuk distribusi gender - format baru untuk stacked bar
  const genderData = [
    { month: 'Januari', laki: 65, perempuan: 35, total: 100 },
    { month: 'Februari', laki: 70, perempuan: 30, total: 100 },
    { month: 'Maret', laki: 55, perempuan: 45, total: 100 },
    { month: 'April', laki: 60, perempuan: 40, total: 100 },
    { month: 'Mei', laki: 75, perempuan: 25, total: 100 },
    { month: 'Juni', laki: 50, perempuan: 50, total: 100 },
  ];

  // Data untuk sebaran kekerasan seksual per jurusan
  const departmentData = [
    { name: 'Teknologi Informasi', value: 18, color: '#F59E0B', percentage: '36%' },
    { name: 'Kesehatan', value: 12, color: '#EF4444', percentage: '24%' },
    { name: 'Manajemen Agribisnis', value: 8, color: '#10B981', percentage: '16%' },
    { name: 'Teknik', value: 7, color: '#3B82F6', percentage: '14%' },
    { name: 'Produksi Pertanian', value: 5, color: '#8B5CF6', percentage: '10%' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Sebaran Kekerasan per Kategori */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
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
        </div>

        {/* Loading State */}
        {loadingCategory ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-8 bg-gray-100 rounded-lg w-full"></div>
              </div>
            ))}
          </div>
        ) : categoryData.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPieChart className="w-7 h-7 text-purple-300" />
            </div>
            <p className="text-gray-500 font-medium text-base">Belum ada laporan yang masuk.</p>
            <p className="text-gray-400 text-sm mt-1">Grafik akan muncul otomatis ketika ada data laporan.</p>
          </div>
        ) : (
          /* Horizontal Bar Chart */
          <>
            <div className="space-y-4">
              {categoryData.map((item, index) => {
                const isHighest = item.rawCount === Math.max(...categoryData.map(d => d.rawCount));
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.hexColor }}
                        ></div>
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{item.percentage}</span>
                        <span className="text-sm text-gray-500 ml-2">({item.rawCount} laporan)</span>
                      </div>
                    </div>

                    {/* Bar Container */}
                    <div className="relative h-8 rounded-lg bg-gray-100 overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full rounded-lg transition-all duration-800 ease-out ${isHighest ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-gradient-to-r from-purple-400 to-purple-500'
                          }`}
                        style={{ width: `${item.value}%` }}
                      >
                        {/* Label inside bar for larger bars */}
                        {item.value > 20 && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <span className="text-xs font-medium text-white">{item.percentage}</span>
                          </div>
                        )}
                      </div>

                      {/* Label outside bar for smaller bars */}
                      {item.value <= 20 && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-xs font-medium text-gray-700">{item.percentage}</span>
                        </div>
                      )}
                    </div>

                    {/* Additional info */}
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{item.rawCount} laporan</span>
                      <span>{item.percentage} dari total {totalReports} kasus</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Kategori tertinggi: <span className="font-bold text-purple-700">{highestCategory?.name} ({highestCategory?.percentage})</span>
                </span>
                <span className="text-sm text-gray-500">Total: {totalReports} kasus</span>
              </div>
            </div>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total laporan: {totalReports} kasus</span>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              Lihat detail →
            </button>
          </div>
        </div>
      </div>

      {/* Chart 2: Distribusi Gender Pelapor - Grouped Bar Chart */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Distribusi Gender Pelapor</h3>
              <p className="text-sm text-gray-500">Perbandingan perempuan vs laki-laki per bulan</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
              <span className="text-sm text-gray-600">Laki-laki</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
              <span className="text-sm text-gray-600">Perempuan</span>
            </div>
          </div>
        </div>

        {/* Grouped Bar Chart */}
        <div className="space-y-6">
          {genderData.map((item, index) => (
            <div key={index} className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{item.month}</span>
                <span className="text-sm text-gray-500">Total: {item.laki + item.perempuan}%</span>
              </div>

              <div className="flex items-end space-x-4 h-40">
                {/* Laki-laki Bar */}
                <div className="flex-1">
                  <div className="text-center mb-2 flex flex-col items-center">
                    <span className="text-[10px] sm:text-xs font-bold text-gray-500">Laki-laki</span>
                    <span className="text-sm font-bold text-[#3B82F6]">{item.laki}%</span>
                  </div>
                  <div className="relative w-full flex justify-center">
                    <div
                      className="w-full bg-[#3B82F6] rounded-t-lg transition-all duration-500 ease-out"
                      style={{ height: `${item.laki * 2}px` }}
                    ></div>
                  </div>
                </div>

                {/* Perempuan Bar */}
                <div className="flex-1">
                  <div className="text-center mb-2 flex flex-col items-center">
                    <span className="text-[10px] sm:text-xs font-bold text-gray-500">Perempuan</span>
                    <span className="text-sm font-bold text-[#8B5CF6]">{item.perempuan}%</span>
                  </div>
                  <div className="relative w-full flex justify-center">
                    <div
                      className="w-full bg-[#8B5CF6] rounded-t-lg transition-all duration-500 ease-out"
                      style={{ height: `${item.perempuan * 2}px` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Comparison */}
              <div className="flex justify-between text-xs text-gray-500 pt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                  <span>Laki-laki: {item.laki}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#8B5CF6]"></div>
                  <span>Perempuan: {item.perempuan}%</span>
                </div>
                <div className={`font-medium ${item.laki > item.perempuan ? 'text-blue-600' :
                  item.laki < item.perempuan ? 'text-purple-600' : 'text-gray-600'
                  }`}>
                  Selisih: {Math.abs(item.laki - item.perempuan)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Rata-rata: <span className="font-medium text-blue-600">62% Laki-laki</span>,
              <span className="font-medium text-purple-600 ml-2">38% Perempuan</span>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
              <span>Lihat detail</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chart 3: Sebaran Kekerasan Seksual per Gedung - Horizontal Ranking Bar Chart */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <FiBarChart2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Sebaran Kekerasan Seksual per Jurusan</h3>
              <p className="text-sm text-gray-500">Data Seluruh Jurusan - Ranking 2024</p>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-900 bg-red-50 px-3 py-1 rounded-full">
            Total: 50 kasus
          </div>
        </div>

        {/* Summary Highlight */}
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Jurusan dengan kasus tertinggi</div>
              <div className="text-xl font-bold text-gray-900">Jurusan Teknologi Informasi</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-red-600">36%</div>
              <div className="text-sm text-gray-500">18 dari 50 kasus</div>
            </div>
          </div>
        </div>

        {/* Horizontal Bar Chart Sorted Descending */}
        <div className="space-y-4">
          {departmentData
            .sort((a, b) => b.value - a.value) // Sort by value descending
            .map((item, index) => {
              const percentage = (item.value / 50) * 100;
              const isHighest = index === 0;
              const isSecond = index === 1;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isHighest
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : isSecond
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.value} kasus • {item.percentage} dari total</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 text-lg">{item.percentage}</div>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="relative h-6 rounded-lg bg-gray-100 overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-lg transition-all duration-800 ease-out ${isHighest
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : isSecond
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600'
                        }`}
                      style={{
                        width: `${percentage}%`
                      }}
                    >
                      {/* Percentage label inside bar (only if width is large enough) */}
                      {percentage > 15 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-xs font-bold text-white">{item.percentage}</span>
                        </div>
                      )}
                    </div>

                    {/* Percentage text outside the bar for smaller portions */}
                    {percentage <= 15 && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-xs font-medium text-gray-700">{percentage.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>

                  {/* Quick stats */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span>{item.value} dari 50 total kasus</span>
                    </div>
                    <span className={`font-medium ${isHighest ? 'text-red-600' :
                      isSecond ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                      Peringkat {index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
              <span className="font-medium">Insight:</span> 60% kasus melibatkan Jurusan TI & Kesehatan
            </div>
            <button
              onClick={() => setShowMapModal(true)}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 group px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              <FiMap className="w-4 h-4 mr-1" />
              <span>Lihat Detail Peta Wilayah Kampus</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <FiMap className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Peta Sebaran Kasus</h3>
                  <p className="text-sm text-gray-500">Distribusi wilayah rawan kekerasan</p>
                </div>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Map Image */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white aspect-video flex items-center justify-center">
                {/* Fallback image if map image is missing or a placeholder */}
                {/* Background placeholder if map image is missing */}
                <div className="absolute inset-0 bg-gray-100 flex flex-col justify-center items-center text-gray-400">
                  <FiMap className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="font-semibold text-gray-500">Peta Kampus</p>
                  <p className="text-sm">Gambar peta belum tersedia</p>
                </div>

                {/* Fallback image if map image is missing or a placeholder */}
                <img
                  src="/Gambar1.jpg" // Menggunakan gambar yang ada di folder public
                  alt="Peta Wilayah Kampus"
                  className="relative w-full h-full object-cover z-0 opacity-20 filter grayscale" // Opacity dikurangi jika itu bukan peta sungguhan
                  onError={(e) => {
                    e.target.style.display = 'none'; // Sembunyikan gambar jika gagal dimuat, akan menampilkan placeholder div di belakangnya
                  }}
                />

                {/* Interactive markers (optional, can be positioned absolute on top of the image) */}
                <div className="absolute top-[30%] left-[45%] group cursor-pointer">
                  <div className="absolute -inset-2 bg-red-400 rounded-full animate-ping opacity-75"></div>
                  <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-md relative z-10"></div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <p className="font-bold text-sm mb-1">Jurusan Teknologi Informasi</p>
                    <p className="text-gray-300">18 Kasus tercatat</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>

                <div className="absolute top-[60%] right-[30%] group cursor-pointer">
                  <div className="absolute -inset-2 bg-red-400 rounded-full animate-ping opacity-75 hidden group-hover:block"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md relative z-10"></div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <p className="font-bold text-sm mb-1">Jurusan Kesehatan</p>
                    <p className="text-gray-300">12 Kasus tercatat</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end">
              <button
                onClick={() => setShowMapModal(false)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Tutup Peta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartSection;