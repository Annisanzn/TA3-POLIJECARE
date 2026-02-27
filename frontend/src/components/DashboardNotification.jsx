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
                const time = s.jam_mulai ? String(s.jam_mulai).substring(0, 5) : '';
                const id = `today-${s.id}`;
                result.push({
                    id,
                    type: 'today',
                    icon: <FiClock className="text-green-600" size={16} />,
                    color: 'border-green-200 bg-green-50',
                    badgeColor: 'bg-green-500',
                    title: `Sesi konseling hari ini pukul ${time} WIB`,
                    body: s.jenis_pengaduan || 'Sesi Konseling',
                    sub: s.user?.name ? `dengan ${s.user.name}` : '',
                    link: role === 'konselor' ? '/konselor/jadwal' : '/operator/counseling-management',
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
                icon: <FiCalendar className="text-blue-600" size={16} />,
                color: 'border-blue-200 bg-blue-50',
                badgeColor: 'bg-blue-500',
                title: `${tomorrowSessions.length} sesi konseling besok`,
                body: tomorrowSessions.map(s => s.jam_mulai ? String(s.jam_mulai).substring(0, 5) + ' WIB' : '').join(', '),
                sub: '',
                link: role === 'konselor' ? '/konselor/jadwal' : '/operator/counseling-management',
            });
        }

        // --- Sessions day after tomorrow ---
        const dayAfterSessions = sessions.filter(s => {
            const d = String(s.tanggal || '').split('T')[0];
            return d === dayAfter && ['approved', 'pending'].includes(s.status);
        });
        if (dayAfterSessions.length > 0) {
            const id = `dayafter`;
            result.push({
                id,
                type: 'dayafter',
                icon: <FiCalendar className="text-indigo-600" size={16} />,
                color: 'border-indigo-200 bg-indigo-50',
                badgeColor: 'bg-indigo-500',
                title: `${dayAfterSessions.length} sesi konseling lusa`,
                body: dayAfterSessions.map(s => s.jam_mulai ? String(s.jam_mulai).substring(0, 5) + ' WIB' : '').join(', '),
                sub: '',
                link: role === 'konselor' ? '/konselor/jadwal' : '/operator/counseling-management',
            });
        }

        // --- Pending counseling sessions (need approval) ---
        const pendingSessions = sessions.filter(s => s.status === 'pending');
        if (pendingSessions.length > 0) {
            const id = 'pending-sessions';
            result.push({
                id,
                type: 'pending',
                icon: <FiAlertTriangle className="text-yellow-600" size={16} />,
                color: 'border-yellow-200 bg-yellow-50',
                badgeColor: 'bg-yellow-500',
                title: `${pendingSessions.length} permintaan sesi menunggu konfirmasi`,
                body: 'Segera tinjau dan setujui permintaan konseling',
                sub: '',
                link: role === 'konselor' ? '/konselor/jadwal' : '/operator/counseling-management',
            });
        }

        // --- Pending complaints (operator only) ---
        if (pendingComplaints > 0) {
            result.push({
                id: 'pending-complaints',
                type: 'complaints',
                icon: <FiAlertTriangle className="text-red-600" size={16} />,
                color: 'border-red-200 bg-red-50',
                badgeColor: 'bg-red-500',
                title: `${pendingComplaints} pengaduan menunggu penanganan`,
                body: 'Tinjau dan proses laporan pengaduan baru',
                sub: '',
                link: '/operator/complaints-management',
            });
        }

        return result;
    }, [role]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let sessions = [];
            let pendingComplaints = 0;

            // Fetch sessions
            const endpoint = role === 'konselor' ? '/konselor/jadwal?per_page=200&sort_by=tanggal&sort_order=asc' : '/operator/counseling?per_page=200&sort_by=tanggal&sort_order=asc';
            const res = await api.get(endpoint);
            const raw = res.data;
            if (Array.isArray(raw?.data?.data)) sessions = raw.data.data;
            else if (Array.isArray(raw?.data)) sessions = raw.data;
            else if (Array.isArray(raw)) sessions = raw;

            // Fetch pending complaints count (operator only)
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

    // Auto-popup on load if there are today's sessions
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
                className="relative p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
                title="Notifikasi"
            >
                <FiBell size={18} className={unreadCount > 0 ? 'text-indigo-600' : ''} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    <div className="absolute right-0 top-12 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600">
                            <div className="flex items-center gap-2">
                                <FiBell className="text-white" size={16} />
                                <h4 className="font-bold text-white text-sm">Notifikasi Dashboard</h4>
                                {unreadCount > 0 && (
                                    <span className="px-1.5 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full">{unreadCount}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button onClick={dismissAll} className="text-white/70 hover:text-white text-xs">Tutup semua</button>
                                )}
                                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                                    <FiX size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent mr-2"></div>
                                    Memuat notifikasi...
                                </div>
                            ) : visibleNotifs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                    <FiCheckCircle size={32} className="mb-3 text-green-400" />
                                    <p className="text-sm font-medium text-gray-600">Semua beres!</p>
                                    <p className="text-xs mt-1">Tidak ada notifikasi aktif saat ini</p>
                                    <button onClick={fetchData} className="mt-3 text-xs text-indigo-500 hover:underline">Muat ulang</button>
                                </div>
                            ) : (
                                <div className="p-3 space-y-2">
                                    {visibleNotifs.map(notif => (
                                        <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-xl border ${notif.color} relative`}>
                                            <div className="flex-shrink-0 mt-0.5">{notif.icon}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-800">{notif.title}</p>
                                                <p className="text-[11px] text-gray-600 mt-0.5">{notif.body}</p>
                                                {notif.sub && <p className="text-[10px] text-gray-400 mt-0.5">{notif.sub}</p>}
                                                <Link to={notif.link} onClick={() => setOpen(false)} className="inline-flex items-center gap-1 text-[11px] text-indigo-600 font-medium mt-1.5 hover:underline">
                                                    Lihat detail <FiChevronRight size={10} />
                                                </Link>
                                            </div>
                                            <button onClick={() => dismissNotif(notif.id)} className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <p className="text-[10px] text-gray-400">Notifikasi diperbarui otomatis saat login</p>
                            <button onClick={fetchData} className="text-[11px] text-indigo-500 font-medium hover:underline">
                                Refresh
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardNotification;
