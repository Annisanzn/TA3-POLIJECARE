import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiUser, FiVideo, FiMapPin,
  FiCheck, FiX, FiLoader, FiAlertCircle, FiChevronRight,
  FiArrowRight, FiInfo, FiHelpCircle
} from 'react-icons/fi';
import counselingService from '../../services/counselingService';
import { useAuth } from '../../hooks/useAuth';
import {
  pageTransition, cardHover, buttonTap, listItem,
  floatingAnimation, pulseAnimation, shimmerEffect
} from '../../utils/motionVariants';

const CounselingRequestPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [method, setMethod] = useState('online');
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');
  const [complaintId, setComplaintId] = useState('');
  const [jenisPengaduan, setJenisPengaduan] = useState('');

  // Load counselors on component mount
  useEffect(() => {
    fetchCounselors();
  }, []);

  // Fetch available counselors
  const fetchCounselors = async () => {
    try {
      setIsLoading(true);
      const response = await counselingService.getCounselors();
      if (response.success) {
        setCounselors(response.data);
      }
    } catch (err) {
      setError('Gagal memuat data konselor');
      console.error('Error fetching counselors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available slots when counselor and date are selected
  useEffect(() => {
    if (selectedCounselor && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedCounselor, selectedDate]);

  // Fetch available time slots
  const fetchAvailableSlots = async () => {
    try {
      setIsLoading(true);
      const response = await counselingService.getAvailableSlots(selectedCounselor, selectedDate);
      if (response.success) {
        setAvailableSlots(response.data.slots);
        setSelectedSlot(null); // Reset selected slot
      }
    } catch (err) {
      setError('Gagal memuat slot waktu yang tersedia');
      console.error('Error fetching slots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCounselor || !selectedDate || !selectedSlot || !method) {
      setError('Harap lengkapi semua field yang wajib diisi');
      return;
    }

    if (method === 'online' && !meetingLink) {
      // Auto-generate meeting link if not provided
      setMeetingLink(counselingService.generateMeetingLink());
    }

    if (method === 'offline' && !location) {
      setError('Harap isi lokasi untuk konseling offline');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const scheduleData = {
        counselor_id: selectedCounselor,
        complaint_id: complaintId || null,
        jenis_pengaduan: jenisPengaduan || '',
        tanggal: selectedDate,
        jam_mulai: selectedSlot.jam_mulai,
        jam_selesai: selectedSlot.jam_selesai,
        metode: method,
        lokasi: method === 'offline' ? location : null,
        meeting_link: method === 'online' ? meetingLink : null,
      };

      const response = await counselingService.requestSchedule(scheduleData);

      if (response.success) {
        setSuccess('Permintaan jadwal konseling berhasil dikirim!');
        // Reset form
        resetForm();
      } else {
        setError(response.message || 'Gagal mengirim permintaan');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mengirim permintaan');
      console.error('Error submitting schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedCounselor('');
    setSelectedDate('');
    setAvailableSlots([]);
    setSelectedSlot(null);
    setMethod('online');
    setMeetingLink('');
    setLocation('');
    setComplaintId('');
    setJenisPengaduan('');
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  // Get selected counselor name
  const getSelectedCounselorName = () => {
    const counselor = counselors.find(c => c.id === parseInt(selectedCounselor));
    return counselor ? counselor.name : '';
  };

  return (
    <motion.div
      {...pageTransition}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Ajukan Jadwal Konseling</h1>
              <p className="text-gray-600">
                Pilih konselor, tanggal, dan waktu untuk sesi konseling Anda
              </p>
            </div>
            <motion.div
              variants={floatingAnimation}
              animate="animate"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full"
            >
              <FiInfo className="w-4 h-4" />
              <span className="text-sm font-medium">Langkah 1 dari 3</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                <FiX className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
            >
              <FiCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-700 font-medium">{success}</p>
                <p className="text-green-600 text-sm mt-1">
                  Notifikasi telah dikirim ke konselor dan operator. Anda akan menerima konfirmasi via email.
                </p>
              </div>
              <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">
                <FiX className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Select Counselor */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Pilih Konselor</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konselor <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCounselor}
                  onChange={(e) => setSelectedCounselor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                >
                  <option value="">Pilih Konselor</option>
                  {counselors.map((counselor) => (
                    <option key={counselor.id} value={counselor.id}>
                      {counselor.name} - {counselor.email}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Pilih konselor yang sesuai dengan kebutuhan Anda
                </p>
              </div>
            </div>

            {/* Step 2: Select Date and Time */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <FiCalendar className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Pilih Tanggal & Waktu</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={!selectedCounselor || isLoading}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Pilih tanggal dalam 30 hari ke depan
                  </p>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          disabled={!slot.available || isLoading}
                          className={`p-3 rounded-lg border transition-all ${selectedSlot?.jam_mulai === slot.jam_mulai
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : slot.available
                                ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                          <div className="text-sm font-medium">{slot.display}</div>
                          <div className="text-xs mt-1">
                            {slot.available ? (
                              <span className="text-green-600">Tersedia</span>
                            ) : (
                              <span className="text-red-600">Terbooking</span>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-4 text-gray-500">
                        {selectedCounselor && selectedDate
                          ? 'Memuat slot waktu...'
                          : 'Pilih konselor dan tanggal terlebih dahulu'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Time Info */}
              {selectedSlot && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-blue-50 rounded-xl border border-blue-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">Waktu Terpilih</p>
                      <p className="text-blue-700">
                        {selectedDate && new Date(selectedDate).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                        {' • '}
                        {selectedSlot.display}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSlot(null)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Step 3: Select Method */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FiVideo className="w-4 h-4 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Pilih Metode Konseling</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Online Option */}
                <button
                  type="button"
                  onClick={() => setMethod('online')}
                  className={`p-4 rounded-xl border-2 transition-all ${method === 'online'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'online' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                      <FiVideo className={`w-5 h-5 ${method === 'online' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Online</p>
                      <p className="text-sm text-gray-600">Video call via link meeting</p>
                    </div>
                    {method === 'online' && (
                      <div className="ml-auto">
                        <FiCheck className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                  </div>
                </button>

                {/* Offline Option */}
                <button
                  type="button"
                  onClick={() => setMethod('offline')}
                  className={`p-4 rounded-xl border-2 transition-all ${method === 'offline'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'offline' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                      <FiMapPin className={`w-5 h-5 ${method === 'offline' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Offline</p>
                      <p className="text-sm text-gray-600">Bertemu langsung di lokasi</p>
                    </div>
                    {method === 'offline' && (
                      <div className="ml-auto">
                        <FiCheck className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {/* Method-specific fields */}
              <AnimatePresence>
                {method === 'online' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link Meeting
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={meetingLink}
                          onChange={(e) => setMeetingLink(e.target.value)}
                          placeholder="https://meet.google.com/xxx-yyyy-zzz"
                        />
                        <button
                          type="button"
                          onClick={() => setMeetingLink(counselingService.generateMeetingLink())}
                          className="px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                        >
                          Generate Link
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Kosongkan untuk generate link otomatis
                      </p>
                    </div>
                  </motion.div>
                )}

                {method === 'offline' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lokasi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ruangan Konseling, Gedung A, Lantai 3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required={method === 'offline'}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Tentukan lokasi pertemuan untuk konseling offline
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 4: Additional Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <FiChevronRight className="w-4 h-4 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Informasi Tambahan (Opsional)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Pengaduan Terkait
                  </label>
                  <input
                    type="text"
                    value={complaintId}
                    onChange={(e) => setComplaintId(e.target.value)}
                    placeholder="Contoh: P-2026-00123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Jika konseling terkait dengan pengaduan tertentu
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Pengaduan
                  </label>
                  <input
                    type="text"
                    value={jenisPengaduan}
                    onChange={(e) => setJenisPengaduan(e.target.value)}
                    placeholder="Contoh: Kekerasan Verbal, Pelecehan, dll"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Jenis pengaduan yang akan didiskusikan
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="w-5 h-5 animate-spin" />
                      Mengirim Permintaan...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-5 h-5" />
                      Ajukan Jadwal Konseling
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Setelah diajukan, permintaan akan ditinjau oleh operator dan konselor. Anda akan menerima notifikasi via email.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CounselingRequestPage;
