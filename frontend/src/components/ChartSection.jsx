import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiPieChart, FiUsers } from 'react-icons/fi';

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

const ChartSection = () => {
  const [activeYear, setActiveYear] = useState('2024');

  const years = ['Semua', '2023', '2024', '2025'];

  // Data untuk kategori kekerasan (dengan warna hex untuk donut chart)
  const categoryData = [
    { name: 'Perundungan', value: 45, color: '#7C3AED', percentage: '45%', hexColor: '#7C3AED' },
    { name: 'Verbal', value: 30, color: '#A78BFA', percentage: '30%', hexColor: '#A78BFA' },
    { name: 'Fisik', value: 15, color: '#10B981', percentage: '15%', hexColor: '#10B981' },
    { name: 'Non-Fisik', value: 10, color: '#F59E0B', percentage: '10%', hexColor: '#F59E0B' },
  ];

  // Data untuk distribusi gender - format baru untuk stacked bar
  const genderData = [
    { month: 'Januari', laki: 65, perempuan: 35, total: 100 },
    { month: 'Februari', laki: 70, perempuan: 30, total: 100 },
    { month: 'Maret', laki: 55, perempuan: 45, total: 100 },
    { month: 'April', laki: 60, perempuan: 40, total: 100 },
    { month: 'Mei', laki: 75, perempuan: 25, total: 100 },
    { month: 'Juni', laki: 50, perempuan: 50, total: 100 },
  ];

  // Data untuk sebaran kekerasan seksual per gedung
  const buildingData = [
    { name: 'Gedung A (Rektorat)', value: 12, color: '#EF4444', percentage: '24%' },
    { name: 'Gedung B (Fakultas)', value: 18, color: '#F59E0B', percentage: '36%' },
    { name: 'Gedung C (Lab. Komputer)', value: 8, color: '#10B981', percentage: '16%' },
    { name: 'Gedung D (Perpustakaan)', value: 7, color: '#3B82F6', percentage: '14%' },
    { name: 'Gedung E (Student Center)', value: 5, color: '#8B5CF6', percentage: '10%' },
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

        {/* Horizontal Bar Chart */}
        <div className="space-y-4">
          {categoryData.map((item, index) => {
            const isHighest = item.value === Math.max(...categoryData.map(d => d.value));
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
                    <span className="text-sm text-gray-500 ml-2">({item.value} laporan)</span>
                  </div>
                </div>
                
                {/* Bar Container */}
                <div className="relative h-8 rounded-lg bg-gray-100 overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-lg transition-all duration-800 ease-out ${
                      isHighest ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-gradient-to-r from-purple-400 to-purple-500'
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
                  <span>{item.value} laporan</span>
                  <span>{item.percentage} dari total 100 kasus</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Kategori tertinggi: <span className="font-bold text-purple-700">Perundungan (45%)</span>
            </span>
            <span className="text-sm text-gray-500">Total: 100 kasus</span>
          </div>
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
              
              <div className="flex items-end space-x-4 h-32">
                {/* Laki-laki Bar */}
                <div className="flex-1">
                  <div className="text-center mb-1">
                    <span className="text-xs font-medium text-gray-700">{item.laki}%</span>
                  </div>
                  <div className="relative">
                    <div
                      className="w-full bg-[#3B82F6] rounded-t-lg transition-all duration-500 ease-out"
                      style={{ height: `${item.laki * 2}px` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                          <span className="text-xs font-bold text-gray-900">Laki</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Perempuan Bar */}
                <div className="flex-1">
                  <div className="text-center mb-1">
                    <span className="text-xs font-medium text-gray-700">{item.perempuan}%</span>
                  </div>
                  <div className="relative">
                    <div
                      className="w-full bg-[#8B5CF6] rounded-t-lg transition-all duration-500 ease-out"
                      style={{ height: `${item.perempuan * 2}px` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-[#8B5CF6]"></div>
                          <span className="text-xs font-bold text-gray-900">Perempuan</span>
                        </div>
                      </div>
                    </div>
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
                <div className={`font-medium ${
                  item.laki > item.perempuan ? 'text-blue-600' :
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
              <h3 className="font-bold text-gray-900">Sebaran Kekerasan Seksual per Gedung</h3>
              <p className="text-sm text-gray-500">Jurusan Teknologi Informasi - Ranking 2024</p>
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
              <div className="text-sm text-gray-600">Gedung dengan kasus tertinggi</div>
              <div className="text-xl font-bold text-gray-900">Gedung B (Fakultas)</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-red-600">36%</div>
              <div className="text-sm text-gray-500">18 dari 50 kasus</div>
            </div>
          </div>
        </div>

        {/* Horizontal Bar Chart Sorted Descending */}
        <div className="space-y-4">
          {buildingData
            .sort((a, b) => b.value - a.value) // Sort by value descending
            .map((item, index) => {
              const percentage = (item.value / 50) * 100;
              const isHighest = index === 0;
              const isSecond = index === 1;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isHighest
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
                      className={`absolute left-0 top-0 h-full rounded-lg transition-all duration-800 ease-out ${
                        isHighest
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : isSecond
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600'
                      }`}
                      style={{
                        width: `${percentage}%`
                      }}
                    >
                      {/* Percentage label inside bar */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-xs font-bold text-white">{item.percentage}</span>
                      </div>
                    </div>
                    
                    {/* Background percentage text */}
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs font-medium text-gray-700">{percentage.toFixed(1)}%</span>
                    </div>
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
                    <span className={`font-medium ${
                      isHighest ? 'text-red-600' :
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
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span className="font-medium">Insight:</span> 60% kasus terjadi di Gedung A & B
            </div>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 group">
              <span>Lihat peta sebaran</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;