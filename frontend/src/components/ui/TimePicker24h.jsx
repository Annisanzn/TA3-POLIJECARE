import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiChevronDown } from 'react-icons/fi';

const TimePicker24h = ({ value, onChange, label, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse value (Expects HH:mm)
  const currentVal = value || '00:00';
  const hoursVal = currentVal.split(':')[0] || '00';
  const minutesVal = currentVal.split(':')[1] || '00';

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (h, m) => {
    onChange(`${h}:${m}`);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2 block font-['Poppins']">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-4 bg-gray-50/50 border-2 transition-all flex items-center justify-between rounded-[28px] text-base font-medium outline-none font-['Poppins']
          ${isOpen ? 'bg-white border-purple-500 shadow-lg' : 'border-transparent hover:border-gray-100'}
          ${error ? 'border-rose-500 bg-rose-50/50' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          <FiClock className={isOpen ? 'text-purple-500' : 'text-gray-400'} size={20} />
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value ? `${value} WIB` : '-- : --'}
          </span>
        </div>
        <FiChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-purple-500' : 'text-gray-400'}`} size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] top-full left-0 right-0 bg-white border border-gray-100 shadow-2xl rounded-[32px] overflow-hidden p-4 flex gap-4 h-[320px] font-['Poppins']"
          >
            {/* Hours Column */}
            <div className="flex-1 flex flex-col items-center">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">JAM</span>
              <div className="w-full flex-1 overflow-y-auto custom-scrollbar space-y-1">
                {hours.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleSelect(h, minutesVal)}
                    className={`w-full py-3 rounded-2xl text-base font-medium transition-all ${
                      hoursVal === h ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-100 self-stretch my-4"></div>

            {/* Minutes Column */}
            <div className="flex-1 flex flex-col items-center">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">MENIT</span>
              <div className="w-full flex-1 overflow-y-auto custom-scrollbar space-y-1">
                {minutes.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelect(hoursVal, m)}
                    className={`w-full py-3 rounded-2xl text-base font-medium transition-all ${
                      minutesVal === m ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}} />
    </div>
  );
};

export default TimePicker24h;
