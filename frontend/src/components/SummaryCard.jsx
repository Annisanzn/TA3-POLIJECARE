import React from 'react';
import { FiFilePlus, FiRefreshCw, FiCheckCircle, FiFileText } from 'react-icons/fi';

const SummaryCard = ({ title, value, icon, badge, trend, description }) => {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'new':
        return <FiFilePlus className="w-6 h-6 text-purple-600" />;
      case 'processing':
        return <FiRefreshCw className="w-6 h-6 text-blue-600" />;
      case 'completed':
        return <FiCheckCircle className="w-6 h-6 text-green-600" />;
      case 'total':
        return <FiFileText className="w-6 h-6 text-purple-700" />;
      default:
        return <FiFileText className="w-6 h-6 text-gray-600" />;
    }
  };

  const getBadgeColor = (trend) => {
    if (trend?.includes('+')) return 'bg-green-100 text-green-800';
    if (trend?.includes('-')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
            {getIcon(icon)}
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        </div>
        
        {badge && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(trend)}`}>
            {badge}
          </span>
        )}
      </div>

      {trend && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              trend.includes('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend}
            </span>
            <span className="text-gray-500 text-sm">dari bulan lalu</span>
          </div>
          {description && (
            <span className="text-gray-400 text-xs">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;