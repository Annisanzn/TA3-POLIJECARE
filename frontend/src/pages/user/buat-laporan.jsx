import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertCircle, ArrowLeft, Shield, User, FileText,
    MapPin, Calendar, Paperclip, CheckCircle, Search
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import UserLayout from '../../components/user/UserLayout';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const CAMPUS_LOCATIONS = [
    // POLIJE LOCATIONS
    { name: 'Gedung Asih Polije (Gedung A)', lat: -8.15783, lng: 113.72265 },
    { name: 'Gedung Baju Polije (Gedung B)', lat: -8.15758, lng: 113.72252 },
    { name: 'Gedung Cerdas Polije (Gedung C)', lat: -8.15730, lng: 113.72230 },
    { name: 'Gedung Jurusan Teknologi Informasi Polije (JTI)', lat: -8.15850, lng: 113.72200 },
    { name: 'Gedung Jurusan Kesehatan Polije', lat: -8.15810, lng: 113.72300 },
    { name: 'Gedung Jurusan Manajemen Agribisnis Polije (JMA)', lat: -8.15700, lng: 113.72350 },
    { name: 'Gedung Jurusan Produksi Pertanian Polije', lat: -8.15650, lng: 113.72400 },
    { name: 'Gedung Jurusan Peternakan Polije', lat: -8.15600, lng: 113.72450 },
    { name: 'Gedung Jurusan Teknik Polije', lat: -8.15900, lng: 113.72100 },
    { name: 'Gedung Jurusan Bahasa Polije', lat: -8.15800, lng: 113.72150 },
    { name: 'Perpustakaan Polije', lat: -8.15750, lng: 113.72300 },
    { name: 'Masjid Al-Kautsar Polije', lat: -8.15820, lng: 113.72450 },
    { name: 'GOR Perjuangan 45 Polije', lat: -8.15950, lng: 113.72250 },
    { name: 'Poliklinik Polije', lat: -8.15680, lng: 113.72180 },
    { name: 'Kantin Polije (Pujasera)', lat: -8.15880, lng: 113.72350 },
    { name: 'Asrama Mahasiswa Polije', lat: -8.16000, lng: 113.72500 },

    // UNEJ LOCATIONS
    { name: 'Rektorat Universitas Jember (Unej)', lat: -8.16388, lng: 113.71536 },
    { name: 'Fakultas Ilmu Komputer (FASILKOM) Unej', lat: -8.16250, lng: 113.71600 },
    { name: 'Fakultas Kedokteran (FK) Unej', lat: -8.16450, lng: 113.71350 },
    { name: 'Fakultas Kedokteran Gigi (FKG) Unej', lat: -8.16500, lng: 113.71400 },
    { name: 'Fakultas Farmasi Unej', lat: -8.16480, lng: 113.71450 },
    { name: 'Fakultas Kesehatan Masyarakat (FKM) Unej', lat: -8.16400, lng: 113.71300 },
    { name: 'Fakultas Keperawatan Unej', lat: -8.16350, lng: 113.71250 },
    { name: 'Fakultas Teknik (FT) Unej', lat: -8.16100, lng: 113.71700 },
    { name: 'Fakultas Pertanian (FAPERTA) Unej', lat: -8.16200, lng: 113.71800 },
    { name: 'Fakultas Teknologi Pertanian (FTP) Unej', lat: -8.16150, lng: 113.71850 },
    { name: 'Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA) Unej', lat: -8.16300, lng: 113.71650 },
    { name: 'Fakultas Hukum (FH) Unej', lat: -8.16550, lng: 113.71500 },
    { name: 'Fakultas Keguruan dan Ilmu Pendidikan (FKIP) Unej', lat: -8.16600, lng: 113.71600 },
    { name: 'Fakultas Ekonomi dan Bisnis (FEB) Unej', lat: -8.16650, lng: 113.71700 },
    { name: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP) Unej', lat: -8.16500, lng: 113.71800 },
    { name: 'Fakultas Ilmu Budaya (FIB) Unej', lat: -8.16550, lng: 113.71900 },
    { name: 'Double Way Unej', lat: -8.16400, lng: 113.71500 },
    { name: 'Perpustakaan Pusat Unej', lat: -8.16350, lng: 113.71450 },
    { name: 'Masjid Al-Hikmah Unej', lat: -8.16300, lng: 113.71350 },
    { name: 'Gedung Soetardjo Unej', lat: -8.16420, lng: 113.71580 },
    { name: 'Gedung PKM Unej', lat: -8.16480, lng: 113.71650 },
    { name: 'Kawasan Stadion Unej', lat: -8.16200, lng: 113.71400 },
    { name: 'Auditorium Unej', lat: -8.16450, lng: 113.71550 },
    { name: 'Asrama Mahasiswa (Rusunawa) Unej', lat: -8.16100, lng: 113.71200 },
];

// Fix Leaflet missing icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const BuatLaporan = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [categories, setCategories] = useState([]);
    const [counselors, setCounselors] = useState([]);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [createdComplaintId, setCreatedComplaintId] = useState(null);

    const defaultCenter = [-8.1643, 113.7169]; // Jember Default Coordinate
    const [mapPosition, setMapPosition] = useState(null);
    const [mapSearchQuery, setMapSearchQuery] = useState('');
    const [isSearchingMap, setIsSearchingMap] = useState(false);
    const mapRef = useRef(null);

    // Schedule Selection State
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [scheduleSubmitted, setScheduleSubmitted] = useState(false);
    const [realSchedules, setRealSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);

    const handleScheduleSubmit = async () => {
        if (!selectedSchedule || !createdComplaintId) return;

        setLoadingSchedules(true);
        try {
            const sch = realSchedules.find(s => s.id === selectedSchedule);

            // Extract HH:mm from various possible time formats
            const extractTime = (timeVal) => {
                if (!timeVal) return '09:00';
                const str = String(timeVal);
                // If ISO datetime like "2026-01-01T09:00:00.000000Z"
                if (str.includes('T')) {
                    const timePart = str.split('T')[1];
                    return timePart.substring(0, 5);
                }
                // If already "09:00:00" or "09:00"
                return str.substring(0, 5);
            };

            // Helper to get next concrete date from day name (Indonesian + English)
            const getNextDateFromDayName = (dayStr) => {
                const map = {
                    'minggu': 0, 'sunday': 0,
                    'senin': 1, 'monday': 1,
                    'selasa': 2, 'tuesday': 2,
                    'rabu': 3, 'wednesday': 3,
                    'kamis': 4, 'thursday': 4,
                    'jumat': 5, 'friday': 5,
                    'sabtu': 6, 'saturday': 6,
                };
                const target = map[dayStr.toLowerCase()];
                if (target === undefined) return new Date().toISOString().split('T')[0];
                const today = new Date();
                let diff = target - today.getDay();
                if (diff <= 0) diff += 7;
                today.setDate(today.getDate() + diff);
                const offset = today.getTimezoneOffset();
                const localDate = new Date(today.getTime() - (offset * 60 * 1000));
                return localDate.toISOString().split('T')[0];
            };

            // Use backend-computed next_date if available, otherwise calculate
            const tanggal = sch.next_date || getNextDateFromDayName(sch.hari);

            const payload = {
                counselor_id: Number(formData.counselor_id),
                complaint_id: Number(createdComplaintId),
                jenis_pengaduan: `Tindak Lanjut Laporan ${formData.title.substring(0, 50)}`,
                tanggal: tanggal,
                jam_mulai: extractTime(sch.jam_mulai),
                jam_selesai: extractTime(sch.jam_selesai),
                metode: "offline",
                lokasi: "Ruang Konseling Satgas PPKS Polije"
            };
            console.log("Schedule booking payload:", payload);

            const res = await fetch(`${API_BASE_URL}/user/counselings`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => null);
                console.error("Schedule API error:", res.status, errBody);
                const errMsg = errBody?.message || errBody?.errors
                    ? `${errBody.message || ''}${errBody.errors ? ' — ' + Object.values(errBody.errors).flat().join(', ') : ''}`
                    : `Server error ${res.status}`;
                throw new Error(errMsg);
            }

            setScheduleSubmitted(true);
            setTimeout(() => {
                navigate('/user/report/history');
            }, 2000);
        } catch (error) {
            console.error("Schedule error:", error);
            alert(error.message || "Gagal mengamankan jadwal. Silakan coba lagi.");
        } finally {
            setLoadingSchedules(false);
        }
    };

    const handleMapSearch = async () => {
        if (!mapSearchQuery.trim()) return;
        setIsSearchingMap(true);
        try {
            // First Priority: Try to match manual internal campus predefined location
            const searchLower = mapSearchQuery.toLowerCase();
            const campusMatch = CAMPUS_LOCATIONS.find(loc =>
                loc.name.toLowerCase().includes(searchLower)
            );

            if (campusMatch) {
                const newPos = { lat: campusMatch.lat, lng: campusMatch.lng };
                setMapPosition(newPos);
                if (mapRef.current) {
                    mapRef.current.flyTo(newPos, 16);
                }
                setFormData(prev => ({ ...prev, location: campusMatch.name }));
                setIsSearchingMap(false);
                return;
            }

            // Second Priority: Fetch from Nominatim API
            let osmMapsQuery = mapSearchQuery;
            if (!osmMapsQuery.toLowerCase().includes("jember")) {
                osmMapsQuery += " Jember"; // Automate scope
            }

            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(osmMapsQuery)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
                setMapPosition(newPos);
                if (mapRef.current) {
                    mapRef.current.flyTo(newPos, 15);
                }
                setFormData(prev => ({ ...prev, location: display_name.split(',')[0] }));
            } else {
                alert('Lokasi tidak ditemukan. Coba nama spesifik seperti "Gedung JTI Polije" atau "Fasilkom Unej".');
            }
        } catch (error) {
            console.error('Error pencarian peta:', error);
            alert('Gagal mencari lokasi. Coba lagi nanti.');
        } finally {
            setIsSearchingMap(false);
        }
    };

    const [formData, setFormData] = useState({
        victim_type: 'self',
        victim_name: '',
        victim_relationship: '',
        counselor_id: '',
        urgency_level: 'medium',
        is_anonymous: false,
        title: '',
        violence_category_id: '',
        chronology: '',
        location: '',
        incident_date: '',
        attachment: null
    });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
        };
    };

    useEffect(() => {
        // Sync Map to form lat/lng
        if (mapPosition) {
            setFormData(prev => ({
                ...prev,
                latitude: mapPosition.lat,
                longitude: mapPosition.lng
            }));
        }
    }, [mapPosition]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Categories
                const catRes = await fetch(`${API_BASE_URL}/user/categories`, {
                    method: 'GET',
                    headers: getAuthHeaders(),
                });
                const catData = await catRes.json();
                if (catRes.ok) setCategories(catData?.data || catData);

                // Fetch Counselors (Accessible API Path based on api.php)
                const counRes = await fetch(`${API_BASE_URL}/user/counselors`, {
                    method: 'GET',
                    headers: getAuthHeaders(),
                });
                const counData = await counRes.json();
                if (counRes.ok) setCounselors(counData?.data || counData);
            } catch (err) {
                console.error('Gagal memuat data API (Kategori / Konselor)', err);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Basic validate
            if (file.size > 10 * 1024 * 1024) {
                alert("Ukuran file maksimal 10MB");
                return;
            }
            setFormData(prev => ({ ...prev, attachment: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError('');

        try {
            // Map 'self/other' string logically depending on the requirement
            // If the backend accepts self/other, the current state is fine.

            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('violence_category_id', formData.violence_category_id);
            payload.append('victim_type', formData.victim_type);

            if (formData.victim_type === 'other') {
                payload.append('victim_name', formData.victim_name);
                payload.append('victim_relationship', formData.victim_relationship);
            }

            payload.append('counselor_id', formData.counselor_id);
            payload.append('urgency_level', formData.urgency_level);
            payload.append('is_anonymous', formData.is_anonymous ? 1 : 0);
            payload.append('description', formData.chronology); // API requirement backward-compatibility
            payload.append('chronology', formData.chronology);
            payload.append('location', formData.location);
            if (formData.incident_date) payload.append('incident_date', formData.incident_date);
            if (formData.latitude) payload.append('latitude', formData.latitude);
            if (formData.longitude) payload.append('longitude', formData.longitude);
            if (formData.attachment) payload.append('attachment', formData.attachment);

            const response = await fetch(`${API_BASE_URL}/user/reports`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    Accept: 'application/json'
                    // Don't set Content-Type for FormData, browser does it automatically with boundary.
                },
                body: payload,
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const errorMessage = data?.message || data?.error || 'Terjadi kesalahan saat menyimpan formulir.';
                throw new Error(errorMessage);
            }

            if (data?.data?.id) {
                setCreatedComplaintId(data.data.id);
            }

            setSuccess(true);

            // Will show the Schedule Selection Screen now!
            // Fetch real counselor schedules
            setLoadingSchedules(true);
            try {
                const schedRes = await fetch(`${API_BASE_URL}/user/counselor-schedules?counselor_id=${formData.counselor_id}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });
                const schedData = await schedRes.json();
                if (schedRes.ok && schedData.data) {
                    setRealSchedules(schedData.data);
                }
            } catch (err) {
                console.error("Failed to fetch schedules:", err);
            } finally {
                setLoadingSchedules(false);
            }

        } catch (err) {
            console.error('Submit form error:', err);
            setSubmitError(err.message || 'Gagal mengirim laporan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (success && !scheduleSubmitted) {
        const pickedCounselor = counselors.find(c => c.id === formData.counselor_id) || {};
        return (
            <UserLayout user={currentUser}>
                <div className="max-w-5xl mx-auto p-4 md:p-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                        <div className="px-8 py-6 border-b border-gray-100 bg-[#1e1b4b]">
                            <h1 className="text-xl font-bold text-white">Pilih Jadwal Konsultasi</h1>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900">Halo, terima kasih telah mengajukan laporan.</h3>
                                <p className="text-sm text-gray-700">Langkah selanjutnya, silakan pilih jadwal temu yang sesuai dengan waktu Anda dan Konselor <strong>{pickedCounselor.name}</strong>.</p>
                                <p className="text-sm text-[#2e1065] font-semibold">Konseling bersifat rahasia dan aman, dilakukan secara tatap muka maupun online sesuai kesepakatan.</p>
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Profil Singkat</h2>
                                <div className="text-sm text-gray-700 space-y-2">
                                    <p><span className="text-gray-500 inline-block w-32">Nama:</span> {pickedCounselor.name}</p>
                                    <p><span className="text-gray-500 inline-block w-32">Bidang:</span> {pickedCounselor.bio || 'Konseling Umum'}</p>
                                    <p><span className="text-gray-500 inline-block w-32">Pengalaman:</span> 5+ tahun mendampingi mahasiswa dan tenaga pengajar</p>
                                    <p><span className="text-gray-500 inline-block w-32">Metode Konseling:</span> Tatap muka / Online</p>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Pilih Waktu Yang Tersedia</h2>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-gray-100">
                                                <th className="py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                                                <th className="py-3 px-4 font-semibold text-gray-700">Waktu Tersedia</th>
                                                <th className="py-3 px-4 font-semibold text-gray-700">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingSchedules ? (
                                                <tr>
                                                    <td colSpan="3" className="py-6 text-center text-sm text-gray-500">
                                                        Sedang memuat jadwal konselor...
                                                    </td>
                                                </tr>
                                            ) : realSchedules.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="py-6 text-center text-sm text-gray-500">
                                                        Belum ada jadwal konsultasi tambahan yang tersedia untuk konselor ini.
                                                    </td>
                                                </tr>
                                            ) : (
                                                realSchedules.map(sch => {
                                                    // Map backend structure to UI requirement
                                                    const isAvailable = sch.is_active && !sch.is_booked;
                                                    const statusText = sch.is_booked ? 'Sudah Dipesan' : (isAvailable ? 'Tersedia' : 'Berhalangan');

                                                    // Helper to format day name if sch.hari is in English
                                                    const formatDay = (dayStr) => {
                                                        const days = { 'monday': 'Senin', 'tuesday': 'Selasa', 'wednesday': 'Rabu', 'thursday': 'Kamis', 'friday': 'Jumat', 'saturday': 'Sabtu', 'sunday': 'Minggu' };
                                                        return days[dayStr.toLowerCase()] || dayStr;
                                                    };

                                                    return (
                                                        <tr
                                                            key={sch.id}
                                                            onClick={() => isAvailable && setSelectedSchedule(sch.id)}
                                                            className={`border-b border-gray-100 transition-colors ${!isAvailable ? 'opacity-50 cursor-not-allowed bg-gray-50' :
                                                                selectedSchedule === sch.id ? 'bg-purple-100 cursor-pointer' : 'hover:bg-gray-50 cursor-pointer'
                                                                }`}
                                                        >
                                                            <td className="py-4 px-4 text-sm text-gray-900">
                                                                <div className="flex items-center gap-3">
                                                                    {isAvailable && (
                                                                        <input
                                                                            type="radio"
                                                                            className="w-4 h-4 text-[#2e1065] focus:ring-[#2e1065] cursor-pointer"
                                                                            checked={selectedSchedule === sch.id}
                                                                            readOnly
                                                                        />
                                                                    )}
                                                                    {!isAvailable && <div className="w-4 h-4" />}
                                                                    {formatDay(sch.hari)} {/* Tanggal atau Hari rutin */}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4 text-sm text-gray-700">
                                                                {(() => {
                                                                    const extractT = (v) => { const s = String(v || ''); return s.includes('T') ? s.split('T')[1].substring(0, 5) : s.substring(0, 5); };
                                                                    return `${extractT(sch.jam_mulai)} - ${extractT(sch.jam_selesai)} WIB`;
                                                                })()}
                                                            </td>
                                                            <td className="py-4 px-4 text-sm">
                                                                {isAvailable ? (
                                                                    <span className="flex items-center text-green-600 font-medium">
                                                                        <div className="bg-green-600 text-white rounded-sm w-4 h-4 flex items-center justify-center mr-2">
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                                        </div>
                                                                        {statusText}
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center text-red-600 font-medium">
                                                                        <div className="bg-red-100 text-red-600 rounded-sm w-4 h-4 flex items-center justify-center mr-2 font-bold leading-none">
                                                                            ×
                                                                        </div>
                                                                        {statusText}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-center">
                                <button
                                    onClick={handleScheduleSubmit}
                                    disabled={!selectedSchedule}
                                    className="px-8 py-3 bg-[#1e1b4b] text-white font-medium rounded-xl hover:bg-[#2e1065] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                >
                                    Konfirmasi Jadwal & Kirim Permintaan Konseling
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </UserLayout>
        );
    }

    if (scheduleSubmitted) {
        return (
            <UserLayout user={currentUser}>
                <div className="max-w-4xl mx-auto p-4 md:p-8 text-center mt-20">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Jadwal Berhasil Dikonfirmasi!</h2>
                    <p className="text-gray-500">Permintaan konseling Anda telah dikirim ke konselor terkait.</p>
                    <p className="text-sm text-gray-400 mt-4 rounded-full bg-gray-100 px-4 py-2 inline-block">Mengalihkan ke halaman riwayat...</p>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout user={currentUser}>
            <div className="max-w-6xl mx-auto p-4 md:p-8">

                {/* HEADER */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => navigate('/user/dashboard')}
                        className="flex items-center text-gray-500 hover:text-[#8b5cf6] mb-4 transition-colors font-medium text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Buat Laporan Pengaduan</h1>
                    <div className="flex items-start bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100">
                        <Shield className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Identitas Anda akan dirahasiakan. Laporkan kejadian yang Anda alami atau saksikan dengan detail yang lengkap.</p>
                    </div>
                </div>

                {submitError && (
                    <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        <p className="text-sm font-medium">{submitError}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        <p className="text-sm font-medium">Laporan berhasil disubmit! Mengarahkan anda ke histori laporan...</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* DATA PELAPOR */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                <User className="w-5 h-5 mr-2 text-[#8b5cf6]" /> Data Pelapor
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Identitas pelapor diambil secara otomatis dari sistem Polije</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1">Nama Lengkap</label>
                                <div className="font-semibold text-gray-900">{currentUser?.name || 'Pengguna 1'}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1">NIM / NIP</label>
                                <div className="font-semibold text-gray-900">{currentUser?.nim || '-'}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1">Program Studi</label>
                                <div className="font-semibold text-gray-900">{currentUser?.prodi || currentUser?.department || '-'}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1">Semester</label>
                                <div className="font-semibold text-gray-900">{currentUser?.semester || '-'}</div>
                            </div>
                        </div>
                    </section>

                    {/* TIPE KEJADIAN */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-[#8b5cf6]" /> Tipe Kejadian
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Pilih apakah kejadian yang Anda laporkan dialami sendiri atau orang lain</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${formData.victim_type === 'self' ? 'border-[#8b5cf6] bg-purple-50' : 'border-gray-200 hover:border-purple-200'
                                    }`}>
                                    <div className="flex items-center">
                                        <input type="radio" name="victim_type" value="self" checked={formData.victim_type === 'self'} onChange={handleInputChange} className="w-5 h-5 text-[#8b5cf6] accent-[#8b5cf6]" />
                                        <span className="ml-3 font-bold text-gray-800">Kejadian yang saya alami sendiri</span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500 ml-8">Saya sebagai korban langsung dari kejadian ini</p>
                                </label>

                                <label className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${formData.victim_type === 'other' ? 'border-[#8b5cf6] bg-purple-50' : 'border-gray-200 hover:border-purple-200'
                                    }`}>
                                    <div className="flex items-center">
                                        <input type="radio" name="victim_type" value="other" checked={formData.victim_type === 'other'} onChange={handleInputChange} className="w-5 h-5 text-[#8b5cf6] accent-[#8b5cf6]" />
                                        <span className="ml-3 font-bold text-gray-800">Kejadian yang dialami orang lain</span>
                                    </div>
                                </label>
                            </div>

                            {/* Conditional Fields for "Other" Victim */}
                            {formData.victim_type === 'other' && (
                                <div className="mt-6 p-5 bg-purple-50 rounded-xl border border-purple-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Korban <span className="text-red-500">*</span></label>
                                        <input
                                            type="text" name="victim_name" required
                                            value={formData.victim_name} onChange={handleInputChange}
                                            placeholder="Masukkan nama lengkap korban"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Hubungan dengan Korban <span className="text-red-500">*</span></label>
                                        <input
                                            type="text" name="victim_relationship" required
                                            value={formData.victim_relationship} onChange={handleInputChange}
                                            placeholder="Contoh: Teman Kelas, Adik Tingkat"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* PEMILIHAN KONSELOR & INFORMASI TAMBAHAN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-1">Pemilihan Konselor</h2>
                            <p className="text-xs text-gray-500 mb-4">Pilih konselor yang akan menangani laporan ini</p>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Konselor yang Menangani <span className="text-red-500">*</span></label>

                                {counselors.length === 0 ? (
                                    <p className="text-xs text-red-500 mt-2">Gagal memuat data / Belum ada konselor tersedia.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-2">
                                        {counselors.map((c, index) => (
                                            <div
                                                key={c.id}
                                                onClick={() => setFormData(prev => ({ ...prev, counselor_id: c.id }))}
                                                className={`cursor-pointer rounded-2xl overflow-hidden shadow-sm border transition-all duration-200 flex flex-col ${formData.counselor_id === c.id
                                                    ? 'border-[#2e1065] ring-2 ring-[#2e1065] bg-purple-50 scale-[1.02] shadow-md'
                                                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md hover:-translate-y-1'
                                                    }`}
                                            >
                                                {/* Card Photo Header */}
                                                <div className={`w-full h-40 flex justify-center items-end overflow-hidden ${index % 2 === 0 ? 'bg-gray-200' : 'bg-red-700'}`}>
                                                    <img
                                                        src={c.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || c.nama)}&background=random&color=fff&size=512`}
                                                        alt="Photo Konselor"
                                                        className="w-full h-full object-cover object-top mix-blend-multiply"
                                                        style={{ mixBlendMode: 'normal' }}
                                                    />
                                                </div>

                                                {/* Card Body (Name) */}
                                                <div className="w-full p-4 flex flex-col items-center justify-center flex-grow bg-white border-t border-gray-100">
                                                    <h4 className="font-bold text-gray-800 text-sm text-center line-clamp-2 leading-tight">
                                                        {c.name || c.nama}
                                                    </h4>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-1">Informasi Tambahan</h2>
                            <p className="text-xs text-gray-500 mb-4">Lengkapi informasi tambahan untuk membantu proses penanganan</p>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Korban <span className="text-red-500">*</span></label>
                                        <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 block pointer-events-none">
                                            {formData.victim_type === 'self' ? 'Diri Sendiri' : 'Orang Lain'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tingkat Urgensi <span className="text-red-500">*</span></label>
                                        <select
                                            name="urgency_level" required
                                            value={formData.urgency_level} onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                                        >
                                            <option value="low">Rendah</option>
                                            <option value="medium">Sedang</option>
                                            <option value="high">Tinggi</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                                        <input
                                            type="checkbox" name="is_anonymous"
                                            checked={formData.is_anonymous} onChange={handleInputChange}
                                            className="w-5 h-5 rounded border-gray-300 text-[#8b5cf6] focus:ring-[#8b5cf6] accent-[#8b5cf6]"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                                                <Shield className="w-4 h-4 text-gray-500" />
                                                Saya ingin melapor secara anonim
                                            </span>
                                            <span className="text-xs text-gray-500">Identitas saya akan dirahasiakan</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* INFORMASI DASAR */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">Informasi Dasar</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Laporan <span className="text-red-500">*</span></label>
                                <p className="text-xs text-gray-500 mb-2">Berikan judul yang jelas untuk laporan Anda</p>
                                <input
                                    type="text" name="title" required
                                    value={formData.title} onChange={handleInputChange}
                                    placeholder="Contoh: Pelecehan di Koridor Kelas"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori Kekerasan <span className="text-red-500">*</span></label>
                                <p className="text-xs text-gray-500 mb-2">Pilih Kategori sesuai dengan kejadian</p>
                                <select
                                    name="violence_category_id" required
                                    value={formData.violence_category_id} onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                                >
                                    <option value="">-- Pilih Kategori --</option>
                                    {categories.map(c => (
                                        <option key={c.unique_id} value={c.unique_id}>{c.name || c.kategori}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* DETAIL KEJADIAN */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800">Detail Kejadian</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* KRONOLOGI */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Kronologi Kejadian ({formData.victim_type === 'self' ? 'Sebagai Korban' : 'Sebagai Saksi/Pelapor'}) <span className="text-red-500">*</span></label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Jelaskan secara detail kejadian yang Anda {formData.victim_type === 'self' ? 'alami' : 'ketahui'}, termasuk kronologi, pelaku, waktu, tempat, dan dampak yang dirasakan.
                                    <span className="block mt-1 text-[#8b5cf6] font-medium">💡 Ceritakan kejadian secara berurutan waktu untuk membantu kami memahami situasi dengan lebih baik.</span>
                                </p>
                                <textarea
                                    name="chronology" required minLength="50" rows="6"
                                    value={formData.chronology} onChange={handleInputChange}
                                    placeholder="Jelaskan kejadian secara detail, mulai dari awal hingga akhir..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] resize-y"
                                ></textarea>
                                <p className="text-xs text-gray-400 mt-1 text-right">Minimal 50 karakter.</p>
                            </div>

                            {/* LOKASI DAN TANGGAL */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Lokasi Kejadian <span className="text-red-500">*</span></label>
                                    <p className="text-xs text-gray-500 mb-2">Sebutkan lokasi detail kejadian</p>
                                    <div className="relative">
                                        <MapPin className="w-4 h-4 absolute left-4 top-3.5 text-gray-400" />
                                        <input
                                            type="text" name="location" required
                                            value={formData.location} onChange={handleInputChange}
                                            placeholder="Contoh: Gedung A Lantai 3"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Kejadian <span className="text-red-500">*</span></label>
                                    <p className="text-xs text-gray-500 mb-2">Hari dan tanggal peristiwa</p>
                                    <div className="relative">
                                        <Calendar className="w-4 h-4 absolute left-4 top-3.5 text-gray-400" />
                                        <input
                                            type="date" name="incident_date" required
                                            value={formData.incident_date} onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* PETA */}
                            <div className="pt-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1 flex justify-between items-center">
                                    <span>Pilih Lokasi pada Peta <span className="text-red-500">*</span></span>
                                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Klik peta atau cari alamat untuk menandai lokasi</span>
                                </label>

                                <div className="flex gap-2 my-2">
                                    <div className="relative flex-1">
                                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={mapSearchQuery}
                                            onChange={(e) => setMapSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleMapSearch())}
                                            placeholder="Cari desa, jalan, gedung (Misal: Gedung Asih Polije)"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                                            list="campus-locations"
                                        />
                                        <datalist id="campus-locations">
                                            {CAMPUS_LOCATIONS.map((loc, i) => (
                                                <option key={i} value={loc.name} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleMapSearch}
                                        disabled={isSearchingMap || !mapSearchQuery.trim()}
                                        className="bg-[#8b5cf6] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#7c4ee6] transition-colors disabled:opacity-50"
                                    >
                                        {isSearchingMap ? 'Mencari...' : 'Cari di Peta'}
                                    </button>
                                </div>

                                <div className="h-[250px] w-full rounded-xl overflow-hidden border border-gray-200 relative z-0 mt-2">
                                    <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }} ref={mapRef}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                                    </MapContainer>
                                </div>
                                {mapPosition && (
                                    <p className="text-xs text-green-600 mt-2 font-medium">✓ Koordinat terpilih: {mapPosition.lat.toFixed(5)}, {mapPosition.lng.toFixed(5)}</p>
                                )}
                                {!mapPosition && (
                                    <p className="text-xs text-red-500 mt-2">Mohon klik salah satu titik di peta untuk menandai pin lokasi.</p>
                                )}
                                <div className="flex items-start mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <Shield className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-500"><strong className="text-gray-700">Privasi Terjamin:</strong> Lokasi hanya digunakan untuk keperluan penanganan laporan dan tidak akan disebarkan ke publik.</p>
                                </div>
                            </div>

                            {/* LAMPIRAN */}
                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Lampiran Bukti Pendukung <span className="text-gray-400 font-normal">(Opsional)</span></label>
                                <p className="text-xs text-gray-500 mb-3">JPG, PNG, atau PDF (maks. 10MB)</p>

                                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-[#8b5cf6] transition-colors" />
                                    {formData.attachment ? (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{formData.attachment.name}</p>
                                            <p className="text-xs text-gray-500">{(formData.attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Klik untuk upload file bukti</p>
                                            <p className="text-xs text-gray-400 mt-1">Belum ada file terpilih</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SUBMIT BUTTON */}
                    <div className="flex justify-end pt-4 pb-12">
                        <button
                            type="button" onClick={() => navigate('/user/dashboard')}
                            className="px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors mr-4"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !mapPosition}
                            className="px-8 py-3 bg-[#8b5cf6] text-white font-medium rounded-xl hover:bg-[#7c4ee6] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? 'Menyimpan...' : 'Kirim Laporan Pengaduan'}
                        </button>
                    </div>

                </form>
            </div>
        </UserLayout>
    );
};

export default BuatLaporan;
