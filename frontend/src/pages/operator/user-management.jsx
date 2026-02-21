import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import {
  FiUsers, FiUserPlus, FiSearch, FiFilter, FiEdit, FiTrash2,
  FiCheckCircle, FiAlertCircle, FiDownload, FiPrinter,
  FiUser, FiMessageSquare, FiChevronLeft, FiChevronRight, FiEye, FiEyeOff
} from 'react-icons/fi';
import { userService } from '../../services/userService';

const UserManagementPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    konselor: 0,
    operator: 0,
    pengguna: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 6,
    total_pages: 1
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    nim: '',
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Stats data untuk cards
  const statsData = [
    { title: 'Total User', value: stats.total_users?.toString() || '0', icon: <FiUsers size={20} />, color: 'from-purple-500 to-purple-600', change: '+12%' },
    { title: 'Operator', value: stats.operator?.toString() || '0', icon: <FiUser size={20} />, color: 'from-green-500 to-green-600', change: '+1' },
    { title: 'Konselor', value: stats.konselor?.toString() || '0', icon: <FiMessageSquare size={20} />, color: 'from-blue-500 to-blue-600', change: '+3' },
    { title: 'Pengguna', value: stats.pengguna?.toString() || '0', icon: <FiUser size={20} />, color: 'from-gray-500 to-gray-600', change: '+24' },
  ];

  const itemsPerPage = pagination.per_page;
  const totalPages = pagination.total_pages;

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      console.log('Fetching user data...');
      
      // Fetch stats
      const statsResponse = await userService.getUserStats();
      console.log('Stats response:', statsResponse);
      if (statsResponse.success) {
        setStats(statsResponse.data);
      } else {
        console.warn('Stats API returned unsuccessful:', statsResponse);
      }

      // Fetch users with current filters
      const usersResponse = await userService.getUsers({
        page: currentPage,
        per_page: itemsPerPage,
        search: searchQuery,
        role: roleFilter === 'all' ? 'all' : roleFilter
      });
      
      console.log('Users response:', usersResponse);

      if (usersResponse.success) {
        setUsers(usersResponse.data.users);
        setPagination(usersResponse.data.pagination);
      } else {
        console.warn('Users API returned unsuccessful:', usersResponse);
        setUsers([]);
        setPagination({
          total: 0,
          per_page: itemsPerPage,
          total_pages: 0
        });
        setErrorMessage(usersResponse.message || 'Gagal mengambil data pengguna.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data || error.message);
      setUsers([]);
      setPagination({ total: 0, per_page: itemsPerPage, total_pages: 1 });
      setErrorMessage(error?.message || 'Gagal mengambil data pengguna.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery, roleFilter]);

  const handleAddUser = async () => {
    setModalMode('create');
    setSelectedUser(null);
    setFormError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      nim: '',
    });
    setShowUserModal(true);
  };

  const handleEditUser = (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    setModalMode('edit');
    setSelectedUser(user);
    setFormError('');
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'user',
      nim: user.nim || '',
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        setErrorMessage('');
        await userService.deleteUser(id);
        fetchData(); // Refresh data
      } catch (error) {
        setErrorMessage(error?.message || 'Gagal menghapus pengguna.');
      }
    }
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Nama wajib diisi');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email wajib diisi');
      return;
    }
    if (modalMode === 'create' && !formData.password) {
      setFormError('Password wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        nim: formData.nim ? formData.nim.trim() : null,
      };

      if (modalMode === 'create') {
        payload.password = formData.password;
        await userService.createUser(payload);
      } else {
        if (!selectedUser?.id) {
          setFormError('User tidak valid');
          return;
        }

        if (formData.password) {
          payload.password = formData.password;
        }

        await userService.updateUser(selectedUser.id, payload);
      }

      setShowUserModal(false);
      setSelectedUser(null);
      await fetchData();
    } catch (error) {
      setFormError(error?.message || 'Gagal menyimpan pengguna.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCsv = () => {
    const headers = ['ID', 'Nama', 'Email', 'Role', 'NIM', 'Tanggal Dibuat'];
    const rows = users.map((u) => [
      u.id,
      u.name,
      u.email,
      u.role,
      u.nim || '',
      u.created_at || '',
    ]);

    const escape = (value) => {
      const s = String(value ?? '');
      if (/[\n\r",]/.test(s)) {
        return `"${s.replaceAll('"', '""')}"`;
      }
      return s;
    };

    const csv = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_page_${pagination.current_page || currentPage}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const printTable = () => {
    const win = window.open('', 'PRINT', 'height=700,width=1000');
    if (!win) return;

    const rowsHtml = users.map((u) => {
      const createdAt = u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '';
      return `
        <tr>
          <td>${u.id}</td>
          <td>${u.name ?? ''}</td>
          <td>${u.email ?? ''}</td>
          <td>${u.role ?? ''}</td>
          <td>${u.nim ?? ''}</td>
          <td>${createdAt}</td>
        </tr>
      `;
    }).join('');

    win.document.write(`
      <html>
        <head>
          <title>Manajemen Pengguna</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin: 0 0 12px 0; font-size: 18px; }
            p { margin: 0 0 16px 0; color: #555; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
            th { background: #f3f4f6; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Manajemen Pengguna</h1>
          <p>Halaman ${pagination.current_page || currentPage} dari ${totalPages} — total ${pagination.total} pengguna</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>NIM</th>
                <th>Tanggal Dibuat</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const getRoleBadgeColor = (role) => {
    const roleLower = role.toLowerCase();
    switch (roleLower) {
      case 'konselor': return 'bg-blue-100 text-blue-800';
      case 'operator': return 'bg-green-100 text-green-800';
      case 'pengguna': return 'bg-gray-100 text-gray-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // NOTE: fetch happens only in the single useEffect above (no debounce) to avoid double fetch.

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
              <p className="text-gray-600 mt-1">Kelola data pengguna sistem pelaporan</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari pengguna..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearchQuery(e.target.value);
                  }}
                />
              </div>

              <button
                onClick={handleAddUser}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center space-x-2 hover:shadow-lg hover:scale-[1.03] transition-all duration-200 w-full sm:w-auto"
              >
                <FiUserPlus size={18} />
                <span className="whitespace-nowrap">Tambah Pengguna</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-x-auto">
          {errorMessage && !isLoading && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="flex items-start gap-3 text-red-700">
                <FiAlertCircle className="mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Gagal memuat data</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <span className="text-green-600 text-xs sm:text-sm font-medium">{stat.change} dari bulan lalu</span>
                </div>
              </div>
            ))}
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header with Filters */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Data Pengguna</h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Menampilkan {users.length} pengguna
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 lg:mt-0">
                {/* Role Filter */}
                <div className="flex items-center space-x-2">
                  <FiFilter className="text-gray-400 hidden sm:block" />
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">Semua Role</option>
                    <option value="konselor">Konselor</option>
                    <option value="operator">Operator</option>
                    <option value="user">Pengguna</option>
                  </select>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={exportCsv}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                  >
                    <FiDownload size={14} className="sm:size-4" />
                    <span className="hidden sm:inline">Ekspor</span>
                  </button>
                  <button
                    onClick={printTable}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                  >
                    <FiPrinter size={14} className="sm:size-4" />
                    <span className="hidden sm:inline">Cetak</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] sm:min-w-0">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700">Nama</th>
                    <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">Email</th>
                    <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">Status Email</th>
                    <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700 hidden lg:table-cell">NIM</th>
                    <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">Tanggal Dibuat</th>
                    <th className="text-left py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    // Loading Skeleton
                    Array.from({ length: 6 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="py-3 px-4 sm:py-4 sm:px-6"><div className="h-4 bg-gray-200 rounded"></div></td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6"><div className="h-4 bg-gray-200 rounded w-24 sm:w-32"></div></td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6 hidden sm:table-cell"><div className="h-4 bg-gray-200 rounded w-32 sm:w-40"></div></td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-20 sm:w-24"></div></td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6"><div className="h-4 bg-gray-200 rounded w-16 sm:w-20"></div></td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-20 sm:w-24"></div></td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-24 sm:w-28"></div></td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6"><div className="h-4 bg-gray-200 rounded w-16 sm:w-20"></div></td>
                      </tr>
                    ))
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm text-gray-900 font-medium">#{user.id}</td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6">
                          <div className="flex items-center">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                              <span className="text-purple-600 font-bold text-xs sm:text-sm">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 text-sm sm:text-base">{user.name}</span>
                              <div className="text-gray-500 text-xs sm:hidden">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm text-gray-700 hidden sm:table-cell">{user.email}</td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6 hidden md:table-cell">
                          <div className="flex items-center">
                            {user.email_verified_at ? (
                              <>
                                <FiCheckCircle className="text-green-500 mr-2 size-3 sm:size-4" />
                                <span className="text-green-700 text-xs sm:text-sm font-medium">Terverifikasi</span>
                              </>
                            ) : (
                              <>
                                <FiAlertCircle className="text-yellow-500 mr-2 size-3 sm:size-4" />
                                <span className="text-yellow-700 text-xs sm:text-sm font-medium">Belum Verifikasi</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm text-gray-700 hidden lg:table-cell">
                          {user.nim || '-'}
                        </td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm text-gray-700 hidden md:table-cell">
                          {new Date(user.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-3 px-4 sm:py-4 sm:px-6">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleEditUser(user.id)}
                              className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FiEdit size={14} className="sm:size-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <FiTrash2 size={14} className="sm:size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 sm:py-12 text-center">
                        <div className="text-gray-500">
                          <FiUsers className="mx-auto text-3xl sm:text-4xl mb-3 opacity-50" />
                          <p className="text-base sm:text-lg">Tidak ada data pengguna</p>
                          <p className="text-xs sm:text-sm mt-1">Coba ubah filter pencarian Anda</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && users.length > 0 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="text-xs sm:text-sm text-gray-600 mb-4 lg:mb-0">
                  Halaman {pagination.current_page || currentPage} dari {totalPages} — total {pagination.total} pengguna
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronLeft size={16} className="sm:size-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                          currentPage === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiChevronRight size={16} className="sm:size-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => {
                if (!isSubmitting) {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }
              }}
            />

            <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">
                  {modalMode === 'create' ? 'Tambah Pengguna' : 'Edit Pengguna'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {modalMode === 'create'
                    ? 'Isi data pengguna baru lalu simpan.'
                    : 'Ubah data pengguna lalu simpan.'}
                </p>
              </div>

              <form onSubmit={handleSubmitUser} className="px-6 py-5 space-y-4">
                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nama lengkap"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="email@polije.ac.id"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {modalMode === 'edit' ? '(opsional)' : ''}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-11 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={modalMode === 'create' ? 'Minimal 8 karakter' : 'Kosongkan jika tidak diganti'}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                        disabled={isSubmitting}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={isSubmitting}
                    >
                      <option value="user">Pengguna</option>
                      <option value="konselor">Konselor</option>
                      <option value="operator">Operator</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Admin dianggap sebagai Operator.</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIM (opsional)</label>
                    <input
                      type="text"
                      value={formData.nim}
                      onChange={(e) => setFormData((p) => ({ ...p, nim: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Contoh: 2021001"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isSubmitting) {
                        setShowUserModal(false);
                        setSelectedUser(null);
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-60"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
