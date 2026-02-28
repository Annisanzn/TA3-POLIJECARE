import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { FiPlus, FiChevronLeft, FiChevronRight, FiX, FiCalendar, FiClock, FiUser } from 'react-icons/fi';

const MONTH_NAMES_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const STATUS_COLORS = {
    pending: 'bg-[#F59E0B]',
    approved: 'bg-[#22C55E]',
    completed: 'bg-[#3B82F6]',
    rejected: 'bg-[#F97316]',
    external: 'bg-[#8B5CF6]',
    holiday: 'bg-red-500',
};

const LEGEND_ITEMS = [
    { key: 'pending', label: 'Menunggu Persetujuan', color: 'bg-[#F59E0B]' },
    { key: 'approved', label: 'Disetujui', color: 'bg-[#22C55E]' },
    { key: 'completed', label: 'Selesai', color: 'bg-[#3B82F6]' },
    { key: 'rejected', label: 'Jadwalkan Ulang', color: 'bg-[#F97316]' },
    { key: 'external', label: 'Jadwalkan Ulang Eksternal', color: 'bg-[#8B5CF6]' }
];

const STATUS_LABELS = {
    pending: 'Menunggu Persetujuan',
    approved: 'Disetujui',
    completed: 'Selesai',
    rejected: 'Jadwalkan Ulang',
    external: 'Jadwalkan Ulang Eksternal',
    holiday: 'Hari Libur Nasional',
};

const ID_HOLIDAYS = {
    // 2024
    '2024-01-01': 'Tahun Baru 2024 Masehi',
    '2024-02-08': 'Isra Mikraj',
    '2024-02-10': 'Tahun Baru Imlek',
    '2024-03-11': 'Nyepi',
    '2024-03-29': 'Wafat Isa Al Masih',
    '2024-03-31': 'Hari Paskah',
    '2024-04-10': 'Idul Fitri 1445 H',
    '2024-04-11': 'Idul Fitri 1445 H',
    '2024-05-01': 'Hari Buruh',
    '2024-05-09': 'Kenaikan Isa Al Masih',
    '2024-05-23': 'Waisak',
    '2024-06-01': 'Hari Lahir Pancasila',
    '2024-06-17': 'Idul Adha 1445 H',
    '2024-07-07': 'Tahun Baru Islam 1446 H',
    '2024-08-17': 'Hari Kemerdekaan RI',
    '2024-09-16': 'Maulid Nabi Muhammad SAW',
    '2024-12-25': 'Hari Raya Natal',
    // 2025
    '2025-01-01': 'Tahun Baru 2025 Masehi',
    '2025-01-27': 'Isra Mikraj',
    '2025-01-29': 'Tahun Baru Imlek',
    '2025-03-29': 'Nyepi',
    '2025-03-31': 'Idul Fitri 1446 H',
    '2025-04-01': 'Idul Fitri 1446 H',
    '2025-04-18': 'Wafat Isa Al Masih',
    '2025-04-20': 'Hari Paskah',
    '2025-05-01': 'Hari Buruh',
    '2025-05-12': 'Waisak',
    '2025-05-29': 'Kenaikan Isa Al Masih',
    '2025-06-01': 'Hari Lahir Pancasila',
    '2025-06-06': 'Idul Adha 1446 H',
    '2025-06-27': 'Tahun Baru Islam 1447 H',
    '2025-08-17': 'Hari Kemerdekaan RI',
    '2025-09-05': 'Maulid Nabi Muhammad SAW',
    '2025-12-25': 'Hari Raya Natal',
    // 2026
    '2026-01-01': 'Tahun Baru 2026 Masehi',
    '2026-01-16': 'Isra Mikraj',
    '2026-02-17': 'Tahun Baru Imlek',
    '2026-03-19': 'Nyepi',
    '2026-03-20': 'Idul Fitri 1447 H',
    '2026-03-21': 'Idul Fitri 1447 H',
    '2026-04-03': 'Wafat Isa Al Masih',
    '2026-04-05': 'Hari Paskah',
    '2026-05-01': 'Hari Buruh / Waisak',
    '2026-05-14': 'Kenaikan Isa Al Masih',
    '2026-05-27': 'Idul Adha 1447 H',
    '2026-06-01': 'Hari Lahir Pancasila',
    '2026-06-16': 'Tahun Baru Islam 1448 H',
    '2026-08-17': 'Hari Kemerdekaan RI',
    '2026-08-26': 'Maulid Nabi Muhammad SAW',
    '2026-12-25': 'Hari Raya Natal'
};

const EXTERNAL_AGENDA_KEY = 'counseling_external_agendas';

const loadExternalAgendas = () => {
    try { return JSON.parse(localStorage.getItem(EXTERNAL_AGENDA_KEY) || '[]'); }
    catch { return []; }
};
const saveExternalAgendas = (agendas) => {
    localStorage.setItem(EXTERNAL_AGENDA_KEY, JSON.stringify(agendas));
};

const CounselingCalendar = ({ role = 'konselor' }) => {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [sessions, setSessions] = useState([]);
    const [externalAgendas, setExternalAgendas] = useState(loadExternalAgendas);
    const [selectedDay, setSelectedDay] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ date: '', time: '09:00', title: '', description: '' });
    const [loading, setLoading] = useState(false);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            // Fetch all pages (max 3 pages / 300 records) for the calendar
            let allSessions = [];
            const endpoints = role === 'konselor'
                ? ['/konselor/jadwal?per_page=100&sort_by=tanggal&sort_order=asc']
                : ['/operator/counseling?per_page=100&sort_by=tanggal&sort_order=asc'];

            for (const ep of endpoints) {
                const res = await api.get(ep);
                // Handle both paginated {data:{data:[...]}} and plain {data:[...]} responses
                const raw = res.data;
                let items = [];
                if (Array.isArray(raw?.data?.data)) {
                    items = raw.data.data;
                } else if (Array.isArray(raw?.data)) {
                    items = raw.data;
                } else if (Array.isArray(raw)) {
                    items = raw;
                }
                allSessions = [...allSessions, ...items];
            }
            setSessions(allSessions);
        } catch (err) {
            console.error('Gagal mengambil jadwal konseling:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSessions(); }, [role]);

    // Build YYYY-MM-DD → events map
    const buildEventMap = () => {
        const map = {};
        sessions.forEach(s => {
            if (!s.tanggal) return;
            const d = String(s.tanggal).split('T')[0];
            if (!map[d]) map[d] = [];
            map[d].push({
                id: `s-${s.id}`,
                title: s.jenis_pengaduan || 'Sesi Konseling',
                time: s.jam_mulai ? String(s.jam_mulai).substring(0, 5) : '',
                status: s.status || 'pending',
                nama: s.user?.name || '',
            });
        });
        externalAgendas.forEach(a => {
            if (!map[a.date]) map[a.date] = [];
            map[a.date].push({ id: a.id, title: a.title, time: a.time, status: 'external', nama: '', description: a.description, isExternal: true });
        });

        // Inject holidays
        Object.entries(ID_HOLIDAYS).forEach(([hDate, hName]) => {
            if (!map[hDate]) map[hDate] = [];
            if (!map[hDate].find(e => e.id === `holiday-${hDate}`)) {
                map[hDate].push({
                    id: `holiday-${hDate}`,
                    title: hName,
                    time: '',
                    status: 'holiday',
                    nama: '',
                    description: 'Hari Libur Nasional'
                });
            }
        });

        return map;
    };

    const eventMap = buildEventMap();

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const goToPrevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
    };
    const goToNextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
    };

    const handleDayClick = (day) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDay({ day, dateStr, events: eventMap[dateStr] || [] });
    };

    const handleAddAgenda = () => {
        const prefillDate = selectedDay?.dateStr
            || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        setAddForm({ date: prefillDate, time: '09:00', title: '', description: '' });
        setShowAddModal(true);
    };

    const handleSaveAgenda = () => {
        if (!addForm.title || !addForm.date) return;
        const newAgenda = { id: `ext-${Date.now()}`, title: addForm.title, date: addForm.date, time: addForm.time, description: addForm.description };
        const updated = [...externalAgendas, newAgenda];
        setExternalAgendas(updated);
        saveExternalAgendas(updated);
        setShowAddModal(false);
        if (selectedDay && selectedDay.dateStr === addForm.date) {
            setSelectedDay(prev => ({ ...prev, events: [...prev.events, { ...newAgenda, status: 'external', isExternal: true }] }));
        }
    };

    const handleDeleteExternal = (id) => {
        const updated = externalAgendas.filter(a => a.id !== id);
        setExternalAgendas(updated);
        saveExternalAgendas(updated);
        if (selectedDay) setSelectedDay(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));
    };

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row shadow-sm relative z-10 items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                        <FiCalendar className="text-white" size={16} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Kalender Konseling</h3>
                        <p className="text-xs text-gray-500">Sesi dari sistem + agenda eksternal</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={goToPrevMonth} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600"><FiChevronLeft size={18} /></button>
                    <div className="flex items-center gap-1 mx-2">
                        <select
                            className="bg-transparent font-bold text-gray-800 text-sm focus:outline-none cursor-pointer appearance-none text-right hover:bg-gray-50 rounded px-1"
                            value={currentMonth}
                            onChange={(e) => setCurrentMonth(Number(e.target.value))}
                            title="Pilih Bulan"
                        >
                            {MONTH_NAMES_ID.map((m, i) => (
                                <option key={i} value={i}>{m}</option>
                            ))}
                        </select>
                        <select
                            className="bg-transparent font-bold text-gray-800 text-sm focus:outline-none cursor-pointer appearance-none hover:bg-gray-50 rounded px-1"
                            value={currentYear}
                            onChange={(e) => setCurrentYear(Number(e.target.value))}
                            title="Pilih Tahun"
                        >
                            {Array.from({ length: 10 }, (_, i) => today.getFullYear() - 2 + i).map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={goToNextMonth} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600"><FiChevronRight size={18} /></button>
                    <button onClick={() => { fetchSessions(); }} className="ml-1 p-2 hover:bg-white rounded-lg transition-colors text-gray-500 text-xs font-medium">↻ Refresh</button>
                    <button onClick={handleAddAgenda} className="ml-2 flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                        <FiPlus size={14} /> Tambah Agenda
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* Calendar Grid */}
                <div className="flex-1 p-4">
                    <div className="grid grid-cols-7 mb-2">
                        {DAY_NAMES_ID.map(d => (
                            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
                        ))}
                    </div>

                    {loading ? (
                        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent mr-2"></div>
                            Memuat jadwal...
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1">
                            {cells.map((day, idx) => {
                                if (!day) return <div key={`pad-${idx}`} />;
                                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const dayEvents = eventMap[dateStr] || [];
                                const isToday = dateStr === todayStr;
                                const isSelected = selectedDay?.dateStr === dateStr;
                                return (
                                    <motion.button
                                        key={dateStr}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDayClick(day)}
                                        className={`relative min-h-[70px] rounded-2xl p-2 text-left transition-colors border
                                            ${isSelected ? 'border-indigo-500 bg-indigo-50/80 shadow-md ring-2 ring-indigo-200' : 'border-gray-50 hover:bg-indigo-50/40 hover:border-indigo-100 hover:shadow-sm'}
                                            ${isToday ? 'bg-indigo-50/30' : ''}
                                        `}
                                    >
                                        <span className={`text-xs font-black block mb-1.5 ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>{day}</span>
                                        <div className="flex flex-wrap gap-1">
                                            {dayEvents.slice(0, 3).map(ev => (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    key={ev.id}
                                                    className={`w-2.5 h-2.5 rounded-full shadow-sm ${STATUS_COLORS[ev.status] || 'bg-gray-400'}`}
                                                    title={ev.title}
                                                ></motion.span>
                                            ))}
                                            {dayEvents.length > 3 && <span className="text-[10px] text-indigo-400 font-bold leading-none mt-0.5">+{dayEvents.length - 3}</span>}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100">
                        {LEGEND_ITEMS.map((item) => (
                            <div key={item.key} className="flex items-center gap-1.5 text-xs text-gray-500">
                                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>{item.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Day Detail Panel */}
                <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-100 p-5 bg-gray-50/30 relative">
                    <AnimatePresence mode="wait">
                        {selectedDay ? (
                            <motion.div
                                key={selectedDay.dateStr}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="h-full flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-extrabold text-gray-800 text-sm tracking-wide">
                                        {new Date(selectedDay.dateStr + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </h4>
                                    <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-red-500 bg-white p-1.5 rounded-full shadow-sm transition-colors"><FiX size={14} /></button>
                                </div>
                                {selectedDay.events.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-gray-400">
                                        <div className="bg-white p-4 rounded-full shadow-sm mb-3 text-indigo-200">
                                            <FiCalendar size={32} />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Tidak ada jadwal</p>
                                        <p className="text-xs text-gray-400">Belum ada sesi untuk hari ini</p>
                                        <button onClick={handleAddAgenda} className="mt-4 px-4 py-2 bg-white border border-indigo-100 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-50 transition-all shadow-sm flex items-center gap-1.5"><FiPlus /> Tambah Agenda</button>
                                    </div>
                                ) : (
                                    <div className="flex-1 space-y-3 overflow-y-auto pr-1 pb-4 custom-scrollbar">
                                        {selectedDay.events.map((ev, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                key={ev.id}
                                                className={`p-3.5 rounded-2xl border shadow-sm transition-all hover:shadow-md ${ev.isExternal ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-white' : 'border-gray-100 bg-white'}`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-800 leading-tight mb-1">{ev.title}</p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            {ev.time && <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full"><FiClock size={10} />{ev.time}</span>}
                                                            {ev.nama && <span className="flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-[120px]"><FiUser size={10} />{ev.nama}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm ${STATUS_COLORS[ev.status] || 'bg-gray-400'}`}>
                                                            {STATUS_LABELS[ev.status] || ev.status}
                                                        </span>
                                                        {ev.isExternal && (
                                                            <button onClick={() => handleDeleteExternal(ev.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"><FiX size={12} /></button>
                                                        )}
                                                    </div>
                                                </div>
                                                {ev.description && <p className="text-[11px] text-gray-500 mt-2 pl-1 border-l-2 border-gray-200">{ev.description}</p>}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                                {selectedDay.events.length > 0 && (
                                    <button onClick={handleAddAgenda} className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
                                        <FiPlus size={16} /> Agenda Eksternal
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty-state"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center py-10"
                            >
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <FiCalendar size={32} className="text-gray-400" />
                                </div>
                                <h4 className="text-gray-600 font-bold mb-1">Pilih Tanggal</h4>
                                <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">Klik pada tanggal kalender di sebelah kiri untuk melihat detail sesi dan agenda.</p>
                                {!loading && sessions.length > 0 && (
                                    <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                        {sessions.length} Sesi Terjadwal
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Add External Agenda Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 overflow-hidden relative"
                        >
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                            <div className="flex items-center justify-between mb-6 pt-2">
                                <h3 className="font-extrabold text-gray-900 text-lg">Tambah Agenda Eksternal</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><FiX size={18} /></button>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Judul Agenda <span className="text-red-500">*</span></label>
                                    <input type="text" value={addForm.title} onChange={e => setAddForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Contoh: Konseling Individu - Mahasiswa X"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Tanggal <span className="text-red-500">*</span></label>
                                        <input type="date" value={addForm.date} onChange={e => setAddForm(p => ({ ...p, date: e.target.value }))}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Jam</label>
                                        <input type="time" value={addForm.time} onChange={e => setAddForm(p => ({ ...p, time: e.target.value }))}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Deskripsi (Opsional)</label>
                                    <textarea value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                                        placeholder="Catatan singkat terkait agenda ini" rows={3}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all resize-none" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
                                <button onClick={handleSaveAgenda} disabled={!addForm.title || !addForm.date}
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-sm hover:shadow">
                                    Simpan Agenda
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-4 text-center">Agenda eksternal disimpan secara lokal di perangkat Anda.</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CounselingCalendar;
