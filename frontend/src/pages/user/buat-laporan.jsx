import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    AlertCircle, ArrowLeft, Shield, User, FileText,
    MapPin, Calendar, Paperclip, CheckCircle, Clock, Info, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import UserLayout from '../../components/user/UserLayout';

import { API_BASE_URL } from '../../config';

const BuatLaporan = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const TIME_SLOTS = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'
    ];

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [createdReportId, setCreatedReportId] = useState('');

    // Manual Schedule Selection State
    const [proposedDate, setProposedDate] = useState('');
    const [proposedTime, setProposedTime] = useState('');

    const [formData, setFormData] = useState({
        victim_type: 'self',
        victim_name: '',
        victim_gender: currentUser?.gender || '',
        victim_relationship: '',
        is_external_victim: false,
        victim_identity_proof: null,
        suspect_name: '',
        suspect_gender: '',
        suspect_status: 'Mahasiswa',
        suspect_affiliation: '',
        suspect_phone: '',
        suspect_whatsapp: '',
        urgency_level: 'medium',
        title: '',
        violence_category_id: '',
        chronology: '',
        location: '',
        incident_date: '',
        attachments: [],
        guest_phone: currentUser?.phone || '',
        guest_email: currentUser?.email || '',
        guest_nim: currentUser?.nim || '',
        guest_prodi: currentUser?.prodi || '',
        guest_unit: currentUser?.unit || ''
    });

    const [fieldErrors, setFieldErrors] = useState({});

    const validateField = (name, value) => {
        switch (name) {
            case 'title':
                return !value ? 'Judul laporan wajib diisi.' : (value.length < 5 ? 'Judul minimal 5 karakter.' : '');
            case 'violence_category_id':
                return !value ? 'Kategori kekerasan wajib dipilih.' : '';
            case 'guest_phone':
                return !value ? 'Nomor WhatsApp wajib diisi.' : (value.length < 8 ? 'Nomor WhatsApp minimal 8 digit.' : '');
            case 'guest_email':
                return !value ? 'Email aktif wajib diisi.' : '';
            case 'location':
                return !value ? 'Lokasi kejadian wajib diisi.' : '';
            case 'incident_date':
                return !value ? 'Tanggal kejadian wajib diisi.' : '';
            case 'chronology':
                if (!value) return 'Kronologi kejadian wajib diisi.';
                if (value.length < 50) return `Kronologi minimal 50 karakter. (saat ini ${value.length} karakter)`;
                return '';
            case 'suspect_name':
                return !value ? 'Nama terlapor wajib diisi.' : '';
            case 'suspect_affiliation':
                return !value ? 'Afiliasi terlapor wajib diisi.' : '';
            case 'victim_name':
                return !value ? 'Nama korban wajib diisi.' : '';
            case 'victim_relationship':
                return !value ? 'Hubungan dengan korban wajib diisi.' : '';
            default:
                return '';
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setFieldErrors(prev => ({ ...prev, [name]: error }));
    };


    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
        };
    };

    useEffect(() => {
        // Enforce profile completion before allowing report creation
        const isProfileIncomplete = currentUser?.role === 'user' && (!currentUser?.gender || !currentUser?.unit || !currentUser?.name);

        if (isProfileIncomplete) {
            toast.error('Mohon lengkapi profil Anda (Nama, Jenis Kelamin, Unit) terlebih dahulu sebelum membuat laporan.');
            navigate('/profile', { replace: true });
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        if (currentUser?.email && !formData.guest_email) {
            setFormData(prev => ({
                ...prev,
                guest_email: currentUser.email
            }));
        }
    }, [currentUser, formData.guest_email]);

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
            } catch (err) {
                console.error('Gagal memuat data API (Kategori)', err);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Clear error on change
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'guest_phone') {
            const digits = value.replace(/\D/g, '');
            const cleanDigits = digits.startsWith('0') ? digits.substring(1) : digits;
            setFormData(prev => ({ ...prev, [name]: cleanDigits }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const validFiles = files.filter(file => {
                if (file.size > 10 * 1024 * 1024) {
                    toast.error(`File ${file.name} melebihi 10MB`);
                    return false;
                }
                return true;
            });
            setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), ...validFiles] }));
        }
    };

    const removeAttachment = (index) => {
        setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        const fieldsToValidate = ['title', 'violence_category_id', 'guest_phone', 'guest_email', 'location', 'incident_date', 'chronology', 'suspect_name', 'suspect_affiliation'];
        if (formData.victim_type === 'other') {
            fieldsToValidate.push('victim_name', 'victim_relationship');
        }

        const errors = {};
        fieldsToValidate.forEach(field => {
            const err = validateField(field, formData[field]);
            if (err) errors[field] = err;
        });

        // Schedule validation
        if (!proposedDate) errors.proposedDate = 'Tanggal usulan jadwal wajib dipilih.';
        if (!proposedTime) errors.proposedTime = 'Jam usulan jadwal wajib dipilih.';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            toast.error('Mohon lengkapi semua kolom yang ditandai merah.');
            // Scroll to first error
            const firstErrorField = document.querySelector('[data-error="true"]');
            if (firstErrorField) firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (proposedDate < today) {
            toast.error('Tanggal usulan jadwal tidak boleh kurang dari hari ini.');
            setLoading(false);
            return;
        }

        // Validate Day (Mon-Thu)
        const selectedDay = new Date(proposedDate + 'T00:00:00').getDay();
        if (selectedDay === 0 || selectedDay >= 5) {
            toast.error('Penanganan (Konseling) hanya tersedia pada hari Senin sampai Kamis.');
            setLoading(false);
            return;
        }

        // Validate Time (08:00-16:00)
        if (proposedTime < '08:00' || proposedTime > '16:00') {
            toast.error('Jam penanganan hanya tersedia antara pukul 08:00 sampai 16:00.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setSubmitError('');

        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('violence_category_id', formData.violence_category_id);
            payload.append('victim_type', formData.victim_type);
            payload.append('victim_gender', formData.victim_gender);
            if (formData.victim_type === 'other') {
                payload.append('victim_name', formData.victim_name);
                payload.append('victim_relationship', formData.victim_relationship);
                payload.append('is_external_victim', formData.is_external_victim ? "1" : "0");
                if (formData.victim_identity_proof) payload.append('victim_identity_proof', formData.victim_identity_proof);
            }
            payload.append('suspect_name', formData.suspect_name);
            payload.append('suspect_gender', formData.suspect_gender);
            payload.append('suspect_status', formData.suspect_status);
            payload.append('suspect_affiliation', formData.suspect_affiliation);
            payload.append('suspect_phone', formData.suspect_phone);
            if (formData.suspect_whatsapp) payload.append('suspect_whatsapp', formData.suspect_whatsapp);
            payload.append('urgency_level', formData.urgency_level);
            payload.append('description', formData.chronology);
            payload.append('chronology', formData.chronology);
            payload.append('location', formData.location);
            if (formData.incident_date) payload.append('incident_date', formData.incident_date);
            if (formData.attachments) formData.attachments.forEach(file => payload.append('attachments[]', file));
            if (formData.guest_phone) payload.append('guest_phone', formData.guest_phone);
            if (formData.guest_email) payload.append('guest_email', formData.guest_email);
            if (formData.guest_nim) payload.append('guest_nim', formData.guest_nim);
            if (formData.guest_prodi) payload.append('guest_prodi', formData.guest_prodi);
            if (formData.guest_unit) payload.append('guest_unit', formData.guest_unit);
            payload.append('proposed_date', proposedDate);
            payload.append('proposed_time', proposedTime);

            const response = await fetch(`${API_BASE_URL}/user/reports`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' },
                body: payload,
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) throw new Error(data?.message || 'Gagal mengirim laporan.');

            if (data?.data?.report_id) {
                setCreatedReportId(data.data.report_id);
            }
            setSuccess(true);
        } catch (err) {
            toast.error(err.message || 'Gagal mengirim laporan.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <UserLayout user={currentUser}>
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#1e1b4b]/40 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="h-32 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center">
                            <CheckCircle className="w-16 h-16 text-white" />
                        </div>
                        <div className="px-8 pt-12 pb-10 text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Laporan Terkirim!</h2>
                            <p className="text-gray-500 mb-8">Nomor registrasi: <span className="font-bold text-[#8b5cf6]">{createdReportId}</span></p>
                            <div className="space-y-4">
                                <a
                                    href={`https://wa.me/6282126432696?text=${encodeURIComponent(
                                        `*KONFIRMASI LAPORAN POLIJECARE*\n\n` +
                                        `Halo Satgas PPKPT Polije, saya telah mengirimkan laporan pengaduan melalui aplikasi PolijeCare.\n\n` +
                                        `*Detail Laporan:*\n` +
                                        `- *ID Laporan:* ${createdReportId}\n` +
                                        `- *Nama Pelapor:* ${currentUser?.name}\n` +
                                        `- *Kategori:* ${categories.find
                                            (c => String(c.unique_id) === String(formData.violence_category_id))?.name || 'Laporan'}\n` +
                                        `- *Judul:* ${formData.title}\n\n` +
                                        `*Usulan Jadwal Penanganan:*\n` +
                                        `- *Tanggal:* ${proposedDate}\n` +
                                        `- *Jam:* ${proposedTime} WIB\n\n` +
                                        `Mohon bantuan untuk proses selanjutnya. Terima kasih.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 bg-[#25D366] text-white font-bold rounded-2xl flex items-center 
                                    justify-center gap-3 shadow-lg shadow-green-100 hover:bg-[#20bd5c] transition-all"
                                >
                                    Konfirmasi via WhatsApp
                                </a>
                                <button onClick={() => navigate('/user/histori-pengaduan')} className="w-full py-4 border-2
                                 border-gray-100 text-gray-500 font-bold rounded-2xl">Lihat Riwayat</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout user={currentUser}>
            <div className="w-full p-4 md:p-8">
                {/* HEADER */}
                <div className="mb-8">
                    <button type="button" onClick={() => navigate('/user/dashboard')} className="flex items-center text-gray-500 hover:text-[#8b5cf6] mb-4 font-medium text-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Buat Laporan Pengaduan</h1>
                    <div className="flex items-start bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100">
                        <Shield className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Identitas Anda akan dirahasiakan. Mohon lengkapi detail kejadian dengan jujur.</p>
                    </div>
                </div>



                <form onSubmit={handleSubmit} className="space-y-4 max-w-[1400px] mx-auto">
                    {/* DATA PELAPOR */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                <User className="w-5 h-5 mr-2 text-[#8b5cf6]" /> Data Pelapor
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">Data pelapor adalah orang yang melaporkan kejadian (bisa diri Anda sendiri sebagai korban, atau orang lain yang melihat kejadian).</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div><label className="text-xs text-gray-500 font-medium block mb-1">Nama</label><div className="font-semibold text-gray-900">{currentUser?.name || '-'}</div></div>
                            <div><label className="text-xs text-gray-500 font-medium block mb-1">NIM/NIP</label><div className="font-semibold text-gray-900">{currentUser?.nim || '-'}</div></div>
                            <div><label className="text-xs text-gray-500 font-medium block mb-1">Prodi</label><div className="font-semibold text-gray-900">{currentUser?.prodi || currentUser?.department || '-'}</div></div>
                            <div><label className="text-xs text-gray-500 font-medium block mb-1">Semester</label><div className="font-semibold text-gray-900">{currentUser?.semester || '-'}</div></div>
                        </div>
                        <div className="px-6 py-4 bg-purple-50/50 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div data-error={!!fieldErrors.guest_phone}>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">WA Aktif <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm font-medium">+62</span>
                                    <input type="text" name="guest_phone" required value={formData.guest_phone} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white border ${fieldErrors.guest_phone ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl pl-12 pr-4 py-2.5 text-sm focus:ring-[#8b5cf6]`} />
                                </div>
                                {fieldErrors.guest_phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.guest_phone}</p>}
                            </div>
                            <div data-error={!!fieldErrors.guest_email}>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Aktif <span className="text-red-500">*</span></label>
                                <input type="email" name="guest_email" required value={formData.guest_email} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white border ${fieldErrors.guest_email ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm focus:ring-[#8b5cf6]`} />
                                {fieldErrors.guest_email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.guest_email}</p>}
                            </div>
                        </div>
                    </section>

                    {/* TIPE KEJADIAN */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center"><FileText className="w-5 h-5 mr-2 text-[#8b5cf6]" /> Tipe Kejadian</h2>
                            <p className="text-xs text-gray-400 mt-1">Pilih siapa yang menjadi korban dalam kejadian ini.</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${formData.victim_type === 'self' ? 'border-[#8b5cf6] bg-purple-50' : 'border-gray-200'}`}>
                                    <div className="flex items-center">
                                        <input type="radio" name="victim_type" value="self" checked={formData.victim_type === 'self'} onChange={handleInputChange} className="w-5 h-5 accent-[#8b5cf6]" />
                                        <span className="ml-3 font-bold text-gray-800">Kejadian yang saya alami sendiri</span>
                                    </div>
                                </label>
                                <label className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${formData.victim_type === 'other' ? 'border-[#8b5cf6] bg-purple-50' : 'border-gray-200'}`}>
                                    <div className="flex items-center">
                                        <input type="radio" name="victim_type" value="other" checked={formData.victim_type === 'other'} onChange={handleInputChange} className="w-5 h-5 accent-[#8b5cf6]" />
                                        <span className="ml-3 font-bold text-gray-800">Kejadian dialami orang lain</span>
                                    </div>
                                </label>
                            </div>

                            <div className="mt-6">
                                <label className="text-sm font-semibold mb-3 block">
                                    {formData.victim_type === 'self' ? 'Jenis Kelamin Anda' : 'Jenis Kelamin Korban'} *
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    <label className={`flex-1 min-w-[140px] cursor-pointer rounded-xl border-2 p-4 transition-all flex items-center gap-3 ${formData.victim_gender === 'Laki-laki' ? 'border-[#8b5cf6] bg-purple-50' : 'border-gray-100 bg-gray-50/30'}`}>
                                        <input type="radio" name="victim_gender" value="Laki-laki" checked={formData.victim_gender === 'Laki-laki'} onChange={handleInputChange} className="w-5 h-5 accent-[#8b5cf6]" />
                                        <span className={`text-sm font-bold ${formData.victim_gender === 'Laki-laki' ? 'text-[#8b5cf6]' : 'text-gray-500'}`}>Laki-laki</span>
                                    </label>
                                    <label className={`flex-1 min-w-[140px] cursor-pointer rounded-xl border-2 p-4 transition-all flex items-center gap-3 ${formData.victim_gender === 'Perempuan' ? 'border-[#8b5cf6] bg-purple-50' : 'border-gray-100 bg-gray-50/30'}`}>
                                        <input type="radio" name="victim_gender" value="Perempuan" checked={formData.victim_gender === 'Perempuan'} onChange={handleInputChange} className="w-5 h-5 accent-[#8b5cf6]" />
                                        <span className={`text-sm font-bold ${formData.victim_gender === 'Perempuan' ? 'text-[#8b5cf6]' : 'text-gray-500'}`}>Perempuan</span>
                                    </label>
                                </div>
                            </div>

                            {formData.victim_type === 'other' && (
                                <div className="mt-6 p-5 bg-purple-50 rounded-xl border border-purple-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div data-error={!!fieldErrors.victim_name}><label className="text-sm font-semibold mb-1 block">Nama Korban *</label><input type="text" name="victim_name" required value={formData.victim_name} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white border ${fieldErrors.victim_name ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm`} />{fieldErrors.victim_name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.victim_name}</p>}</div>
                                    <div data-error={!!fieldErrors.victim_relationship}><label className="text-sm font-semibold mb-1 block">Hubungan *</label><input type="text" name="victim_relationship" required value={formData.victim_relationship} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white border ${fieldErrors.victim_relationship ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm`} />{fieldErrors.victim_relationship && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.victim_relationship}</p>}</div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* DATA TERLAPOR */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center"><User className="w-5 h-5 mr-2 text-rose-500" /> Data Terlapor</h2>
                            <p className="text-xs text-gray-400 mt-1">Data Terlapor adalah orang yang diadukan atau diduga melakukan tindakan kekerasan/perundungan.</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div data-error={!!fieldErrors.suspect_name}><label className="text-sm font-semibold mb-1 block">Nama Terlapor *</label><input type="text" name="suspect_name" required value={formData.suspect_name} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-gray-50 border ${fieldErrors.suspect_name ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm`} />{fieldErrors.suspect_name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.suspect_name}</p>}</div>
                            <div>
                                <label className="text-sm font-semibold mb-1 block">Jenis Kelamin</label>
                                <div className="flex gap-2">
                                    <label className={`flex-1 cursor-pointer rounded-xl border p-2 text-center transition-all ${formData.suspect_gender === 'Laki-laki' ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]' : 'border-gray-200 text-gray-500'}`}>
                                        <input type="radio" name="suspect_gender" value="Laki-laki" className="hidden" checked={formData.suspect_gender === 'Laki-laki'} onChange={handleInputChange} />
                                        <span className="text-xs font-bold">Laki-laki</span>
                                    </label>
                                    <label className={`flex-1 cursor-pointer rounded-xl border p-2 text-center transition-all ${formData.suspect_gender === 'Perempuan' ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]' : 'border-gray-200 text-gray-500'}`}>
                                        <input type="radio" name="suspect_gender" value="Perempuan" className="hidden" checked={formData.suspect_gender === 'Perempuan'} onChange={handleInputChange} />
                                        <span className="text-xs font-bold">Perempuan</span>
                                    </label>
                                </div>
                            </div>
                            <div><label className="text-sm font-semibold mb-1 block">Status *</label>
                                <select name="suspect_status" required value={formData.suspect_status} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm">
                                    <option value="Mahasiswa">Mahasiswa</option>
                                    <option value="Dosen">Dosen</option>
                                    <option value="Tenaga Pendidik">Tenaga Pendidik</option>
                                    <option value="Teknisi">Teknisi</option>
                                    <option value="Office Boy (OB)">Office Boy (OB)</option>
                                    <option value="Satpam">Satpam</option>
                                    <option value="Pihak Luar">Pihak Luar / Lainnya</option>
                                </select>
                            </div>
                            <div data-error={!!fieldErrors.suspect_affiliation}><label className="text-sm font-semibold mb-1 block">Afiliasi *</label><input type="text" name="suspect_affiliation" required value={formData.suspect_affiliation} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-gray-50 border ${fieldErrors.suspect_affiliation ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm`} />{fieldErrors.suspect_affiliation && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.suspect_affiliation}</p>}</div>
                            <div><label className="text-sm font-semibold mb-1 block">WhatsApp Terlapor</label><input type="text" name="suspect_whatsapp" value={formData.suspect_whatsapp} onChange={handleInputChange} placeholder="8123xxx (Jika ada)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm" /></div>
                        </div>
                    </section>

                    {/* USULAN JADWAL */}
                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center"><Calendar className="w-6 h-6 mr-3 text-[#8b5cf6]" /> Usulan Jadwal Penanganan</h2>
                            <p className="text-sm text-gray-500 mt-1">Kapan Anda bersedia untuk berdiskusi lebih lanjut?</p>
                        </div>
                        <div className="p-8">
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-amber-900">Ketentuan Jadwal Penanganan:</p>
                                    <ul className="text-xs text-amber-800 mt-1 list-disc list-inside space-y-1">
                                        <li>Tersedia hari <span className="font-bold">Senin - Kamis</span></li>
                                        <li>Jam operasional <span className="font-bold">08:00 - 16:00 WIB</span></li>
                                        <li>Hari Jumat - Minggu hanya untuk penyampaian laporan (tanpa jadwal penanganan langsung)</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div data-error={!!fieldErrors.proposedDate}>
                                    <label className="text-sm font-semibold mb-2 block">Pilih Tanggal *</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={proposedDate}
                                        onChange={(e) => { setProposedDate(e.target.value); setFieldErrors(prev => ({ ...prev, proposedDate: '' })); }}
                                        className={`w-full bg-gray-50 border ${fieldErrors.proposedDate ? 'border-red-400 ring-2 ring-red-100' : (proposedDate && (new Date(proposedDate + 'T00:00:00').getDay() === 0 || new Date(proposedDate + 'T00:00:00').getDay() >= 5) ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-200')} rounded-2xl px-6 py-4 text-sm transition-all`}
                                    />
                                    {fieldErrors.proposedDate && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.proposedDate}</p>}
                                    {proposedDate && (new Date(proposedDate + 'T00:00:00').getDay() === 0 || new Date(proposedDate + 'T00:00:00').getDay() >= 5) && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="mt-4 p-5 bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-[2rem] shadow-xl shadow-rose-500/5 flex items-start gap-4"
                                        >
                                            <div className="w-10 h-10 bg-rose-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-200 animate-pulse">
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-rose-900">Jadwal Tidak Tersedia</p>
                                                <p className="text-[11px] font-medium text-rose-700 leading-relaxed">
                                                    Maaf, layanan konseling Satgas hanya tersedia hari <span className="font-bold">Senin sampai Kamis</span>.
                                                    Silakan pilih tanggal lain untuk penanganan langsung, atau tetap kirimkan laporan tanpa jadwal penanganan.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                                <div className="col-span-full">
                                    <label className="text-sm font-semibold mb-3 block">Pilih Jam (24 Jam) *</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {TIME_SLOTS.map((time) => (
                                            <button
                                                key={time}
                                                type="button"
                                                onClick={() => { setProposedTime(time); setFieldErrors(prev => ({ ...prev, proposedTime: '' })); }}
                                                className={`px-4 py-3 rounded-2xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2
                                                    ${proposedTime === time
                                                        ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white shadow-lg shadow-purple-200 scale-[0.98]'
                                                        : 'bg-white border-gray-100 text-gray-500 hover:border-purple-200 hover:bg-purple-50'
                                                    }`}
                                            >
                                                <Clock className={`w-4 h-4 ${proposedTime === time ? 'text-white' : 'text-gray-400'}`} />
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                    {fieldErrors.proposedTime ? (
                                        <p className="text-xs text-red-500 mt-3 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.proposedTime}</p>
                                    ) : (
                                        <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
                                            <Info className="w-3 h-3" /> Klik salah satu slot waktu di atas untuk memilih jadwal.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* INFORMASI TAMBAHAN */}
                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="text-sm font-semibold mb-2 block">Tingkat Urgensi *</label><select name="urgency_level" required value={formData.urgency_level} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"><option value="low">Rendah</option><option value="medium">Sedang</option><option value="high">Tinggi</option></select></div>
                            <div data-error={!!fieldErrors.violence_category_id}>
                                <label className="text-sm font-semibold mb-2 block">Kategori Kekerasan *</label>
                                <select name="violence_category_id" required value={formData.violence_category_id} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-gray-50 border ${fieldErrors.violence_category_id ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm`}>
                                    <option value="">-- Pilih --</option>{categories.map(c => (<option key={c.unique_id} value={c.unique_id}>{c.name}</option>))}
                                </select>
                                {fieldErrors.violence_category_id && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.violence_category_id}</p>}
                            </div>
                        </div>
                        <div className="mt-6" data-error={!!fieldErrors.title}>
                            <label className="text-sm font-semibold mb-2 block">Judul Laporan *</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleInputChange} onBlur={handleBlur} placeholder="Judul singkat..." className={`w-full bg-gray-50 border ${fieldErrors.title ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm`} />
                            {fieldErrors.title && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.title}</p>}
                        </div>
                        <div className="mt-6" data-error={!!fieldErrors.chronology}>
                            <label className="text-sm font-semibold mb-1 block">Kronologi * <span className="text-gray-400 font-normal">(Min 50 Karakter)</span></label>
                            <p className="text-xs text-gray-400 mb-2">Kronologi adalah urutan kejadian yang menjelaskan bagaimana peristiwa tersebut berlangsung dari awal hingga akhir secara detail.</p>
                            <textarea name="chronology" required minLength="50" rows="5" value={formData.chronology} onChange={handleInputChange} onBlur={handleBlur} placeholder="Ceritakan secara detail urutan kejadiannya..." className={`w-full bg-gray-50 border ${fieldErrors.chronology ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm`} />
                            <div className="flex items-center justify-between mt-1">
                                {fieldErrors.chronology ? (
                                    <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.chronology}</p>
                                ) : (
                                    <span className="text-xs text-gray-400" />
                                )}
                                <span className={`text-xs font-medium ${formData.chronology.length >= 50 ? 'text-emerald-500' : 'text-gray-400'}`}>
                                    {formData.chronology.length}/50 karakter
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* LOKASI KEJADIAN (MANUAL) */}
                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-50 rounded-lg text-[#8b5cf6]">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Lokasi & Waktu Kejadian</h2>
                                <p className="text-sm text-gray-500">Berikan detail lokasi dan waktu peristiwa secara manual</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div data-error={!!fieldErrors.location}>
                                <label className="text-sm font-semibold mb-2 block">Lokasi Detail *</label>
                                <input
                                    type="text"
                                    name="location"
                                    required
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Contoh: Gedung JTI Lantai 2, Ruang Kelas 05"
                                    className={`w-full bg-gray-50 border ${fieldErrors.location ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#8b5cf6]`}
                                />
                                {fieldErrors.location ? (
                                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.location}</p>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-2">Sebutkan gedung, lantai, atau ruangan spesifik.</p>
                                )}
                            </div>
                            <div data-error={!!fieldErrors.incident_date}>
                                <label className="text-sm font-semibold mb-2 block">Tanggal Kejadian *</label>
                                <input
                                    type="date"
                                    name="incident_date"
                                    required
                                    max={new Date().toISOString().split("T")[0]}
                                    value={formData.incident_date}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`w-full bg-gray-50 border ${fieldErrors.incident_date ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#8b5cf6]`}
                                />
                                {fieldErrors.incident_date && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.incident_date}</p>}
                            </div>
                        </div>
                    </section>

                    {/* LAMPIRAN */}
                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <label className="text-sm font-semibold mb-4 block">Bukti Pendukung (Opsional)</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:bg-gray-50 cursor-pointer relative">
                            <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-bold">Klik atau seret file bukti</p>
                        </div>
                        {formData.attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {formData.attachments.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <span className="text-xs font-bold truncate flex-1 mr-4">{file.name}</span>
                                        <button type="button" onClick={() => removeAttachment(i)} className="text-red-500"><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* SUBMIT */}
                    <div className="flex justify-end gap-4 pb-12">
                        <button type="button" onClick={() => navigate('/user/dashboard')} className="px-8 py-4 font-bold text-gray-500 hover:text-gray-700">Batal</button>
                        <button type="submit" disabled={loading} className="px-10 py-4 bg-[#8b5cf6] text-white font-bold rounded-2xl shadow-lg hover:bg-[#7c4ee6] disabled:opacity-50 flex items-center gap-3">
                            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            Kirim Laporan & Jadwal
                        </button>
                    </div>
                </form>
            </div>
        </UserLayout>
    );
};

export default BuatLaporan;
