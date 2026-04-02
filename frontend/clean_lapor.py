import re

with open("src/pages/public/LaporUmum.jsx", "r") as f:
    text = f.read()

# 1. Imports
text = text.replace("import { useAuth } from '../../hooks/useAuth';", "")
text = text.replace("import UserLayout from '../../components/user/UserLayout';", "import Navbar from '../../components/Navbar';\nimport Footer from '../../components/Footer';")

# 2. Main component definition
text = text.replace("const BuatLaporan = () => {", "const LaporUmum = () => {")

# 3. Inside component
text = text.replace("const { user: currentUser } = useAuth();", "")

# 4. Remove schedule state and handleScheduleSubmit
schedule_start = text.find("// Schedule Selection State")
map_search = text.find("const handleMapSearch = async () => {")
if schedule_start != -1 and map_search != -1:
    text = text[:schedule_start] + text[map_search:]

# 5. FormData initialization
old_formdata = """const [formData, setFormData] = useState({
        victim_type: 'self',
        victim_name: '',
        victim_relationship: '',
        is_external_victim: false,
        victim_identity_proof: null,
        suspect_name: '',
        suspect_status: 'Mahasiswa',
        suspect_affiliation: '',
        counselor_id: '',
        urgency_level: 'medium',
        is_anonymous: false,
        title: '',
        violence_category_id: '',
        chronology: '',
        location: '',
        incident_date: '',
        attachment: null
    });"""

new_formdata = """const [formData, setFormData] = useState({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        victim_type: 'self',
        victim_name: '',
        victim_relationship: '',
        is_external_victim: true, // enforced
        victim_identity_proof: null,
        suspect_name: '',
        suspect_status: 'Mahasiswa',
        suspect_affiliation: '',
        counselor_id: '', // Empty
        urgency_level: 'medium',
        is_anonymous: false,
        title: '',
        violence_category_id: '',
        chronology: '',
        location: '',
        incident_date: '',
        attachment: null
    });"""
text = text.replace(old_formdata, new_formdata)

# 6. getAuthHeaders -> Remove token require
old_auth = """const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
        };
    };"""
new_auth = """const getAuthHeaders = () => {
        return {
            Accept: 'application/json'
        };
    };"""
text = text.replace(old_auth, new_auth)

# 7. handleSubmit modification
text = text.replace("payload.append('is_external_victim', formData.is_external_victim ? \"1\" : \"0\");", "payload.append('is_external_victim', \"1\");")
text = text.replace("if (formData.victim_type === 'other') {", "payload.append('guest_name', formData.guest_name);\n            payload.append('guest_email', formData.guest_email);\n            payload.append('guest_phone', formData.guest_phone);\n            if (formData.victim_type === 'other') {")

text = text.replace("fetch(`${API_BASE_URL}/user/reports`, {", "fetch(`${API_BASE_URL}/public-complaints`, {")
headers_old = """headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    Accept: 'application/json'
                    // Don't set Content-Type for FormData, browser does it automatically with boundary.
                },"""
headers_new = """headers: {
                    Accept: 'application/json'
                },"""
text = text.replace(headers_old, headers_new)

sched_fetch_start = text.find("// Will show the Schedule Selection Screen now!")
catch_submit = text.find("} catch (err) {", sched_fetch_start)
if sched_fetch_start != -1 and catch_submit != -1:
    text = text[:sched_fetch_start] + text[catch_submit:]

# 8. Success blocks
render_start = text.find("if (success && !scheduleSubmitted) {")
render_main = text.find("return (\n        <UserLayout")
if render_start != -1 and render_main != -1:
    new_success_blocks = """
    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-grow w-full max-w-3xl mx-auto p-4 md:p-8 text-center mt-20">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Laporan Berhasil Terkirim!</h2>
                    <p className="text-gray-500 mb-4">Laporan Anda telah masuk ke sistem Satgas PPKPT Politeknik Negeri Jember. Tim Satgas akan segera meninjau laporan Anda dan menghubungi Anda melalui kontak yang telah diberikan.</p>
                    <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#8b5cf6] text-white rounded-xl hover:bg-purple-700">Kembali ke Beranda</button>
                </div>
                <Footer />
            </div>
        );
    }
    """
    text = text[:render_start] + new_success_blocks + text[render_main:]

# 9. Main layout change
text = text.replace("<UserLayout user={currentUser}>", '<div className="min-h-screen bg-gray-50 flex flex-col pt-8">\n            <Navbar />\n            <div className="max-w-5xl mx-auto flex-grow w-full pt-12">')
text = text.replace("</UserLayout>", "</div>\n            <Footer />\n        </div>")

# 10. Data Pelapor Section -> Change to Data Pelapor (Tamu)
data_pelapor = """{/* DATA PELAPOR */}
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
                    </section>"""

new_data_pelapor = """{/* DATA PELAPOR (TAMU) */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                <User className="w-5 h-5 mr-2 text-[#8b5cf6]" /> Kontak Pelapor
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Silakan masukkan kontak yang bisa dihubungi oleh Satgas PPKPT (Identitas Anda TETAP DIRAHSIAKAN)</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Pelapor <span className="text-red-500">*</span></label>
                                <input
                                    type="text" name="guest_name" required
                                    value={formData.guest_name} onChange={handleInputChange}
                                    placeholder="Masukkan nama Anda (atau anonim)"
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nomor Telepon/WhatsApp <span className="text-red-500">*</span></label>
                                <input
                                    type="text" name="guest_phone" required
                                    value={formData.guest_phone} onChange={handleInputChange}
                                    placeholder="Contoh: 08123456789"
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Email <span className="text-gray-400 font-normal">(Opsional)</span></label>
                                <input
                                    type="email" name="guest_email"
                                    value={formData.guest_email} onChange={handleInputChange}
                                    placeholder="kamu@email.com"
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                                />
                            </div>
                        </div>
                    </section>"""
text = text.replace(data_pelapor, new_data_pelapor)

# 11. Remove Pemilihan Konselor
konselor_start = text.find('<section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">\n                            <h2 className="text-lg font-bold text-gray-800 mb-1">Pemilihan Konselor</h2>')
if konselor_start != -1:
    text = text.replace('<section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">\n                            <h2 className="text-lg font-bold text-gray-800 mb-1">Pemilihan Konselor</h2>',
      '<section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hidden">\n                            <h2 className="text-lg font-bold text-gray-800 mb-1">Pemilihan Konselor</h2>')

# 12. "Kembali" routing fix -> instead of /user/dashboard, go to /
text = text.replace("navigate('/user/dashboard')", "navigate('/')")

# 13. Export
text = text.replace("export default BuatLaporan;", "export default LaporUmum;")

with open("src/pages/public/LaporUmum.jsx", "w") as f:
    f.write(text)

