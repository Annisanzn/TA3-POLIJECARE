import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, User, MapPin, AlertCircle, ArrowLeft, Send, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import UserLayout from '../../components/user/UserLayout';
import styles from './CreateComplaintPage.module.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const CreateComplaintPage = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        violence_category_id: '',
        urgency_level: 'rendah',
        is_anonymous: false,
        victim_type: 'diri_sendiri',
        victim_name: '',
        victim_relationship: '',
        description: '',
        chronology: '',
        location: '',
        latitude: '',
        longitude: ''
    });

    const [formErrors, setFormErrors] = useState({});

    const getAuthHeaders = () => {
        const token = localStorage.getItem('auth_token');
        return {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/user/categories`, {
                    method: 'GET',
                    headers: getAuthHeaders(),
                });
                const data = await response.json();
                if (response.ok) {
                    setCategories(data?.data || data);
                }
            } catch (err) {
                console.error('Gagal memuat kategori API', err);
            }
        };
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Hapus pesan error di field tersebut jika mulai ngetik lagi
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Judul laporan wajib diisi';
        if (!formData.violence_category_id) errors.violence_category_id = 'Kategori wajib dipilih';
        if (!formData.description.trim()) errors.description = 'Deskripsi singkat wajib diisi';
        if (!formData.chronology.trim()) errors.chronology = 'Kronologi kejadian wajib diisi';
        if (!formData.location.trim()) errors.location = 'Lokasi kejadian wajib diisi';

        if (formData.victim_type === 'orang_lain') {
            if (!formData.victim_name.trim()) errors.victim_name = 'Nama korban wajib diisi';
            if (!formData.victim_relationship.trim()) errors.victim_relationship = 'Hubungan dengan korban wajib diisi';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setSubmitError('');

        try {
            const response = await fetch(`${API_BASE_URL}/user/reports`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const errorMessage = data?.message || data?.error || 'Terjadi kesalahan pada server saat menyimpan formulir.';
                throw new Error(errorMessage);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/user/report/history');
            }, 2000);

        } catch (err) {
            console.error('Submit form error:', err);
            setSubmitError(err.message || 'Gagal mengirim laporan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/user/report/history');
    };

    return (
        <UserLayout user={currentUser}>
            <div className={styles.page}>

                <header className={styles.header}>
                    <button type="button" className={styles.backButton} onClick={handleBack}>
                        <ArrowLeft size={20} strokeWidth={1.8} />
                        Kembali
                    </button>
                    <div>
                        <h1 className={styles.title}>📝 Buat Pengaduan Baru</h1>
                        <p className="opacity-90 mt-2 mb-4 text-gray-500">Form Laporan Kejadian Pihak Akademik Tertutup dan Rahasia.</p>
                    </div>
                </header>

                {submitError && (
                    <div className={styles.errorCard}>
                        <AlertCircle size={20} />
                        <span>{submitError}</span>
                    </div>
                )}

                {success && (
                    <div className={styles.successCard}>
                        <CheckCircle size={20} />
                        <span>Laporan pengaduan Anda berhasil dikirimkan. Mengarahkan ke histori...</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.content}>

                    {/* SECTION 1: INFORMARSI LAPORAN */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <FileText size={20} strokeWidth={1.8} />
                            Informasi Laporan
                        </h2>

                        <div className={styles.formGrid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Judul Laporan <span className={styles.required}>*</span></label>
                                <input
                                    type="text" name="title"
                                    className={styles.input}
                                    placeholder="Contoh: Pelecehan Verbal di Ruang Dosen"
                                    value={formData.title} onChange={handleInputChange}
                                />
                                {formErrors.title && <span className={styles.errorText}>{formErrors.title}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Kategori Kekerasan <span className={styles.required}>*</span></label>
                                <select
                                    name="violence_category_id"
                                    className={styles.select}
                                    value={formData.violence_category_id} onChange={handleInputChange}
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map((cat, idx) => (
                                        <option key={cat.id || idx} value={cat.id}>{cat.name || cat.kategori || cat.title}</option>
                                    ))}
                                </select>
                                {formErrors.violence_category_id && <span className={styles.errorText}>{formErrors.violence_category_id}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tingkat Urgensi <span className={styles.required}>*</span></label>
                                <select
                                    name="urgency_level"
                                    className={styles.select}
                                    value={formData.urgency_level} onChange={handleInputChange}
                                >
                                    <option value="rendah">Rendah</option>
                                    <option value="sedang">Sedang</option>
                                    <option value="tinggi">Tinggi</option>
                                </select>
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.checkboxContainer}>
                                    <input
                                        type="checkbox" name="is_anonymous"
                                        className={styles.checkboxInput}
                                        checked={formData.is_anonymous} onChange={handleInputChange}
                                    />
                                    <div className={styles.checkboxContent}>
                                        <span className={styles.checkboxTitle}>Laporkan sebagai Anonim</span>
                                        <span className={styles.checkboxDesc}>Identitas Anda akan disembunyikan dari pelapor luar dan dashboard umum.</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: INFORMASI KORBAN */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <User size={20} strokeWidth={1.8} />
                            Informasi Korban
                        </h2>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Jenis Korban <span className={styles.required}>*</span></label>
                            <div className={styles.radioGroup}>
                                <label className={`${styles.radioLabel} ${formData.victim_type === 'diri_sendiri' ? styles.radioLabelActive : ''}`}>
                                    <input
                                        type="radio" name="victim_type" value="diri_sendiri"
                                        className={styles.radioInput}
                                        checked={formData.victim_type === 'diri_sendiri'} onChange={handleInputChange}
                                    />
                                    Diri Sendiri
                                </label>
                                <label className={`${styles.radioLabel} ${formData.victim_type === 'orang_lain' ? styles.radioLabelActive : ''}`}>
                                    <input
                                        type="radio" name="victim_type" value="orang_lain"
                                        className={styles.radioInput}
                                        checked={formData.victim_type === 'orang_lain'} onChange={handleInputChange}
                                    />
                                    Orang Lain
                                </label>
                            </div>
                        </div>

                        {formData.victim_type === 'orang_lain' && (
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Nama Korban <span className={styles.required}>*</span></label>
                                    <input
                                        type="text" name="victim_name"
                                        className={styles.input}
                                        placeholder="Nama korban yang bersangkutan"
                                        value={formData.victim_name} onChange={handleInputChange}
                                    />
                                    {formErrors.victim_name && <span className={styles.errorText}>{formErrors.victim_name}</span>}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Hubungan dengan Pelapor <span className={styles.required}>*</span></label>
                                    <input
                                        type="text" name="victim_relationship"
                                        className={styles.input}
                                        placeholder="Contoh: Teman, Tetangga, Keluarga"
                                        value={formData.victim_relationship} onChange={handleInputChange}
                                    />
                                    {formErrors.victim_relationship && <span className={styles.errorText}>{formErrors.victim_relationship}</span>}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* SECTION 3: DETAIL PENGADUAN */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <FileText size={20} strokeWidth={1.8} />
                            Detail Pengaduan
                        </h2>

                        <div className={styles.formGrid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Deskripsi Singkat Kejadian <span className={styles.required}>*</span></label>
                                <textarea
                                    name="description"
                                    className={styles.textarea}
                                    placeholder="Ringkas cerita pengaduan perlindungan yang terjadi"
                                    value={formData.description} onChange={handleInputChange}
                                ></textarea>
                                {formErrors.description && <span className={styles.errorText}>{formErrors.description}</span>}
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Kronologi Kejadian (Kapan, Siapa, Bagaimana) <span className={styles.required}>*</span></label>
                                <textarea
                                    name="chronology"
                                    className={styles.textarea} style={{ minHeight: '180px' }}
                                    placeholder="Tuliskan cerita komplit berurutan kronologinya"
                                    value={formData.chronology} onChange={handleInputChange}
                                ></textarea>
                                {formErrors.chronology && <span className={styles.errorText}>{formErrors.chronology}</span>}
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Lokasi Kejadian <span className={styles.required}>*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-400">
                                        <MapPin size={18} />
                                    </span>
                                    <input
                                        type="text" name="location"
                                        className={styles.input} style={{ paddingLeft: '36px' }}
                                        placeholder="Contoh: Depan Gedung Rektorat Area Sipil"
                                        value={formData.location} onChange={handleInputChange}
                                    />
                                </div>
                                {formErrors.location && <span className={styles.errorText}>{formErrors.location}</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Latitude <span className="text-gray-400 text-xs ml-1">(opsional)</span></label>
                                <input
                                    type="text" name="latitude"
                                    className={styles.input}
                                    placeholder="-8.xxx"
                                    value={formData.latitude} onChange={handleInputChange}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Longitude <span className="text-gray-400 text-xs ml-1">(opsional)</span></label>
                                <input
                                    type="text" name="longitude"
                                    className={styles.input}
                                    placeholder="113.xxx"
                                    value={formData.longitude} onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </section>

                    <button type="submit" className={styles.submitButton} disabled={loading || success}>
                        {loading ? (
                            <span>Memproses Laporan Anda...</span>
                        ) : (
                            <>Kirim Laporan Pengaduan <Send size={18} /></>
                        )}
                    </button>
                </form>

            </div>
        </UserLayout>
    );
};

export default CreateComplaintPage;
