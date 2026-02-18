// Konfigurasi menu sidebar berdasarkan role
export const sidebarMenu = {
  operator: [
    {
      category: 'UTAMA',
      items: [
        { name: 'Dashboard', icon: 'FiHome', path: '/operator/dashboard', active: true },
      ]
    },
    {
      category: 'MANAJEMEN',
      items: [
        { name: 'Manajemen Pengguna', icon: 'FiUsers', path: '/operator/manajemen-pengguna' },
        { name: 'Manajemen Pengaduan', icon: 'FiFileText', path: '/operator/manajemen-pengaduan' },
        { name: 'Manajemen Materi', icon: 'FiBook', path: '/operator/manajemen-materi' },
        { name: 'Kategori Kekerasan', icon: 'FiTag', path: '/operator/kategori-kekerasan' },
        { name: 'Jadwal Konseling', icon: 'FiCalendar', path: '/operator/jadwal-konseling' },
        { name: 'Jadwal Konselor', icon: 'FiClock', path: '/operator/jadwal-konselor' },
        { name: 'Manajemen Pengumuman', icon: 'FiBell', path: '/operator/manajemen-pengumuman' },
      ]
    },
    {
      category: 'PENGATURAN',
      items: [
        { name: 'Manajemen Admin', icon: 'FiSettings', path: '/operator/manajemen-admin' },
        { name: 'Profil Operator', icon: 'FiUser', path: '/operator/profil' },
      ]
    }
  ],
  
  konselor: [
    {
      category: 'UTAMA',
      items: [
        { name: 'Dashboard', icon: 'FiHome', path: '/konselor/dashboard', active: true },
        { name: 'Jadwal Saya', icon: 'FiCalendar', path: '/konselor/jadwal' },
      ]
    },
    {
      category: 'KONSELING',
      items: [
        { name: 'Sesi Aktif', icon: 'FiClock', path: '/konselor/sesi-aktif' },
        { name: 'Riwayat Konseling', icon: 'FiFileText', path: '/konselor/riwayat' },
        { name: 'Klien Saya', icon: 'FiUsers', path: '/konselor/klien' },
      ]
    },
    {
      category: 'MATERI',
      items: [
        { name: 'Materi Konseling', icon: 'FiBook', path: '/konselor/materi' },
        { name: 'Artikel', icon: 'FiFileText', path: '/konselor/artikel' },
      ]
    }
  ],
  
  user: [
    {
      category: 'UTAMA',
      items: [
        { name: 'Dashboard', icon: 'FiHome', path: '/user/dashboard', active: true },
        { name: 'Buat Laporan', icon: 'FiPlus', path: '/user/buat-laporan' },
      ]
    },
    {
      category: 'LAPORAN SAYA',
      items: [
        { name: 'Laporan Baru', icon: 'FiFileText', path: '/user/laporan-baru' },
        { name: 'Laporan Diproses', icon: 'FiClock', path: '/user/laporan-diproses' },
        { name: 'Riwayat Laporan', icon: 'FiCheck', path: '/user/riwayat' },
      ]
    },
    {
      category: 'KONSELING',
      items: [
        { name: 'Jadwal Konseling', icon: 'FiCalendar', path: '/user/jadwal' },
        { name: 'Riwayat Konseling', icon: 'FiFileText', path: '/user/riwayat-konseling' },
      ]
    }
  ]
};

export default sidebarMenu;