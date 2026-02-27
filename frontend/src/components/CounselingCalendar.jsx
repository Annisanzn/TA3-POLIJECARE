import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FiPlus, FiChevronLeft, FiChevronRight, FiX, FiCalendar, FiClock, FiUser } from 'react-icons/fi';

const MONTH_NAMES_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const STATUS_COLORS = {
    pending: 'bg-red-500',
    approved: 'bg-green-500',
    completed: 'bg-blue-500',
    rejected: 'bg-yellow-400',
    cancelled: 'bg-yellow-400',
    external: 'bg-purple-500',
};

const STATUS_LABELS = {
    pending: 'Menunggu Persetujuan',
    approved: 'Disetujui',
    completed: 'Selesai',
    rejected: 'Jadwalkan Ulang',
    cancelled: 'Jadwalkan Ulang',
    external: 'Eksternal',
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
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
                    <span className="font-bold text-gray-800 min-w-[140px] text-center text-sm">{MONTH_NAMES_ID[currentMonth]} {currentYear}</span>
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
                                    <button
                                        key={dateStr}
                                        onClick={() => handleDayClick(day)}
                                        className={`relative min-h-[60px] rounded-xl p-1.5 text-left transition-all border
                                            ${isSelected ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-transparent hover:bg-gray-50 hover:border-gray-200'}
                                            ${isToday ? 'ring-2 ring-indigo-400' : ''}
                                        `}
                                    >
                                        <span className={`text-xs font-bold block mb-1 ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>{day}</span>
                                        <div className="flex flex-wrap gap-0.5">
                                            {dayEvents.slice(0, 3).map(ev => (
                                                <span key={ev.id} className={`w-2 h-2 rounded-full ${STATUS_COLORS[ev.status] || 'bg-gray-400'}`} title={ev.title}></span>
                                            ))}
                                            {dayEvents.length > 3 && <span className="text-[9px] text-gray-400 font-bold leading-none mt-0.5">+{dayEvents.length - 3}</span>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100">
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <div key={key} className="flex items-center gap-1.5 text-xs text-gray-500">
                                <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[key]}`}></span>{label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Day Detail Panel */}
                <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-100 p-4">
                    {selectedDay ? (
                        <>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-gray-800 text-sm">
                                    {new Date(selectedDay.dateStr + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h4>
                                <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600 p-1"><FiX size={14} /></button>
                            </div>
                            {selectedDay.events.length === 0 ? (
                                <div className="text-center py-6 text-gray-400">
                                    <FiCalendar size={28} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">Tidak ada sesi di hari ini</p>
                                    <button onClick={handleAddAgenda} className="mt-3 text-xs text-indigo-600 font-medium hover:underline">+ Tambah Agenda Eksternal</button>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {selectedDay.events.map(ev => (
                                        <div key={ev.id} className={`p-2.5 rounded-xl border ${ev.isExternal ? 'border-purple-200 bg-purple-50' : 'border-gray-100 bg-gray-50'}`}>
                                            <div className="flex items-start justify-between gap-1">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-gray-800 truncate">{ev.title}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {ev.time && <span className="flex items-center gap-1 text-xs text-gray-500"><FiClock size={10} />{ev.time}</span>}
                                                        {ev.nama && <span className="flex items-center gap-1 text-xs text-gray-500 truncate"><FiUser size={10} />{ev.nama}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium text-white ${STATUS_COLORS[ev.status] || 'bg-gray-400'}`}>
                                                        {STATUS_LABELS[ev.status] || ev.status}
                                                    </span>
                                                    {ev.isExternal && (
                                                        <button onClick={() => handleDeleteExternal(ev.id)} className="text-red-400 hover:text-red-600"><FiX size={12} /></button>
                                                    )}
                                                </div>
                                            </div>
                                            {ev.description && <p className="text-[10px] text-gray-500 mt-1">{ev.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button onClick={handleAddAgenda} className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-indigo-300 text-indigo-600 rounded-xl text-xs font-medium hover:bg-indigo-50 transition-colors">
                                <FiPlus size={12} /> Tambah Agenda Eksternal
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            <FiCalendar size={32} className="mx-auto mb-3 opacity-40" />
                            <p className="text-xs">Klik tanggal untuk melihat detail sesi</p>
                            {!loading && (
                                <p className="text-xs mt-2 text-indigo-500 font-medium">{sessions.length} sesi dimuat dari API</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add External Agenda Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-gray-900">Tambah Agenda Eksternal</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Agenda <span className="text-red-500">*</span></label>
                                <input type="text" value={addForm.title} onChange={e => setAddForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Contoh: Konseling Individu - Mahasiswa X"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal <span className="text-red-500">*</span></label>
                                    <input type="date" value={addForm.date} onChange={e => setAddForm(p => ({ ...p, date: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Jam</label>
                                    <input type="time" value={addForm.time} onChange={e => setAddForm(p => ({ ...p, time: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi (Opsional)</label>
                                <textarea value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Catatan singkat terkait agenda ini" rows={3}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
                            <button onClick={handleSaveAgenda} disabled={!addForm.title || !addForm.date}
                                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                                Simpan Agenda
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-3 text-center">Agenda eksternal disimpan di perangkat ini (lokal)</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CounselingCalendar;
