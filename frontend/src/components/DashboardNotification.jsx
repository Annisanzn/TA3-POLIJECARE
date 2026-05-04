import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { FiBell, FiX, FiCalendar, FiClock, FiAlertTriangle, FiCheckCircle, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const DISMISS_KEY = 'dashboard_notif_dismissed';

const loadDismissed = () => {
    try { return JSON.parse(localStorage.getItem(DISMISS_KEY) || '[]'); }
    catch { return []; }
};

/**
 * DashboardNotification — popup bell icon with smart notifications for konselor/operator:
 *  - Sesi hari ini
 *  - Sesi besok / lusa
 *  - Pengaduan pending persetujuan
 */
const DashboardNotification = ({ role = 'konselor' }) => {
    const [open, setOpen] = useState(false);
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dismissed, setDismissed] = useState(loadDismissed);

    const todayDate = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const addDays = (dateStr, days) => {
        const d = new Date(dateStr + 'T00:00:00');
        d.setDate(d.getDate() + days);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const buildNotifications = useCallback((sessions, pendingComplaints) => {
        const today = todayDate();
        const tomorrow = addDays(today, 1);
        const dayAfter = addDays(today, 2);

        const result = [];

        // --- Sessions today ---
        const todaySessions = sessions.filter(s => {
            const d = String(s.tanggal || '').split('T')[0];
            return d === today && ['approved', 'pending'].includes(s.status);
        });
        if (todaySessions.length > 0) {
            todaySessions.forEach(s => {
                const time = s.jam_mulai ? String(s.jam_mulai).substring(0, 5) + ' WIB' : '';
                const id = `today-${s.id}`;
                result.push({
                    id,
                    type: 'today',
                    icon: <FiClock className="text-green-700" size={16} />,
                    color: 'border-green-200 bg-green-50 shadow-sm',
                    badgeColor: 'bg-green-500',
                    title: `Sesi konseling hari ini pukul ${time}`,
                    body: s.jenis_pengaduan || 'Sesi Konseling',
                    sub: s.user?.name ? `dengan ${s.user.name}` : '',
                    link: role === 'konselor' ? '/konselor/jadwal' : '/operator/case-management',
                });
            });
        }

        // --- Sessions tomorrow ---
        const tomorrowSessions = sessions.filter(s => {
            const d = String(s.tanggal || '').split('T')[0];
            return d === tomorrow && ['approved', 'pending'].includes(s.status);
        });
        if (tomorrowSessions.length > 0) {
            const id = `tomorrow`;
            result.push({
                id,
                type: 'tomorrow',
                icon: <FiCalendar className="text-blue-700" size={16} />,
                color: 'border-blue-200 bg-blue-50 shadow-sm',
                badgeColor: 'bg-blue-500',
                title: `${tomorrowSessions.length} sesi konseling besok`,
                body: tomorrowSessions.map(s => s.jam_mulai ? String(s.jam_mulai).substring(0, 5) + ' WIB' : '').join(', '),
                sub: '',
                link: role === 'konselor' ? '/konselor/jadwal' : '/operator/case-management',
            });
        }

        // --- Pending counseling sessions (need approval) ---
        const pendingSessions = sessions.filter(s => s.status === 'pending');
        if (pendingSessions.length > 0) {
            const id = 'pending-sessions';
            result.push({
                id,
                type: 'pending',
                icon: <FiAlertTriangle className="text-yellow-700" size={16} />,
                color: 'border-yellow-200 bg-yellow-50 shadow-sm',
                badgeColor: 'bg-yellow-500',
                title: `${pendingSessions.length} permintaan sesi menunggu konfirmasi`,
                body: 'Segera tinjau dan setujui permintaan konseling',
                sub: '',
                link: role === 'konselor' ? '/konselor/case-management' : '/operator/case-management',
            });
        }

        // --- Pending complaints (operator only) ---
        if (role === 'operator' && pendingComplaints > 0) {
            result.push({
                id: 'pending-complaints',
                type: 'complaints',
                icon: <FiAlertTriangle className="text-red-700" size={16} />,
                color: 'border-red-200 bg-red-50 shadow-sm',
                badgeColor: 'bg-red-500',
                title: `${pendingComplaints} pengaduan menunggu penanganan`,
                body: 'Tinjau dan proses laporan pengaduan baru',
                sub: '',
                link: '/operator/case-management',
            });
        }

        return result;
    }, [role]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let sessions = [];
            let pendingComplaints = 0;

            const endpoint = role === 'konselor' ? '/konselor/jadwal?per_page=200&sort_by=tanggal&sort_order=asc' : '/operator/counseling?per_page=200&sort_by=tanggal&sort_order=asc';
            const res = await api.get(endpoint);
            const raw = res.data;
            if (Array.isArray(raw?.data?.data)) sessions = raw.data.data;
            else if (Array.isArray(raw?.data)) sessions = raw.data;
            else if (Array.isArray(raw)) sessions = raw;

            if (role === 'operator') {
                try {
                    const cRes = await api.get('/operator/complaints-stats');
                    pendingComplaints = cRes.data?.data?.pending || 0;
                } catch { /* ignore */ }
            }

            const all = buildNotifications(sessions, pendingComplaints);
            setNotifs(all);
        } catch (err) {
            console.error('Notification fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [role, buildNotifications]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const hasToday = notifs.some(n => n.type === 'today' && !dismissed.includes(n.id));
        if (hasToday) setOpen(true);
    }, [notifs]);

    const visibleNotifs = notifs.filter(n => !dismissed.includes(n.id));
    const unreadCount = visibleNotifs.length;

    const dismissNotif = (id) => {
        const updated = [...dismissed, id];
        setDismissed(updated);
        localStorage.setItem(DISMISS_KEY, JSON.stringify(updated));
    };

    const dismissAll = () => {
        const ids = notifs.map(n => n.id);
        const updated = [...new Set([...dismissed, ...ids])];
        setDismissed(updated);
        localStorage.setItem(DISMISS_KEY, JSON.stringify(updated));
        setOpen(false);
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setOpen(v => !v)}
                className="relative p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
                title="Notifikasi"
            >
                <FiBell size={18} className={unreadCount > 0 ? 'text-indigo-600 dark:text-indigo-400' : ''} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse border-2 border-white dark:border-slate-800">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    <div className="fixed inset-x-4 top-24 sm:absolute sm:inset-auto sm:right-0 sm:top-14 z-50 w-auto sm:w-[400px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600">
                            <div className="flex items-center gap-3">
                                <FiBell className="text-white" size={18} />
                                <div>
                                    <h4 className="font-bold text-white text-sm">Pusat Notifikasi</h4>
                                    <p className="text-[11px] text-white/80 font-medium tracking-wide">{unreadCount} Pesan Baru</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {unreadCount > 0 && (
                                    <button onClick={dismissAll} className="text-white/80 hover:text-white text-[10px] font-bold uppercase tracking-wider">Tutup semua</button>
                                )}
                                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white bg-white/10 p-1.5 rounded-lg transition-colors">
                                    <FiX size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-h-[500px] overflow-y-auto no-scrollbar p-4 space-y-3">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-4"></div>
                                    <p className="text-xs font-semibold tracking-wide">Sinkronisasi...</p>
                                </div>
                            ) : visibleNotifs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                                        <FiCheckCircle size={32} className="text-emerald-500" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-700 dark:text-slate-200">Semua Beres!</p>
                                    <p className="text-[10px] uppercase font-medium mt-1 tracking-wider">Tidak ada agenda tertunda</p>
                                </div>
                            ) : (
                                visibleNotifs.map(notif => (
                                    <div key={notif.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${notif.color} relative hover:shadow-md transition-all group`}>
                                        <div className="flex-shrink-0 p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">{notif.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-900 leading-tight">{notif.title}</p>
                                            <p className="text-[11px] text-slate-700 font-medium mt-1">{notif.body}</p>
                                            {notif.sub && <p className="text-[10px] text-slate-500 mt-1 italic">{notif.sub}</p>}
                                            
                                            <Link to={notif.link} onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 text-[11px] text-indigo-600 font-bold mt-4 hover:underline bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm transition-all active:scale-95">
                                                Lihat detail <FiChevronRight size={10} />
                                            </Link>
                                        </div>
                                        <button onClick={() => dismissNotif(notif.id)} className="flex-shrink-0 text-gray-400 hover:text-rose-600 transition-colors p-1">
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Sistem Terkoneksi</p>
                            </div>
                            <button onClick={fetchData} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">
                                Paksa Segarkan
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardNotification;
