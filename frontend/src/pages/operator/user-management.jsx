import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import {
  FiUsers, FiUserPlus, FiSearch, FiFilter, FiEdit, FiTrash2,
  FiCheckCircle, FiAlertCircle, FiDownload, FiPrinter,
  FiUser, FiMessageSquare, FiChevronLeft, FiChevronRight, FiEye, FiEyeOff, FiMenu
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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
      console.log('🔍 Fetching user data...');
      console.log('🔑 Token exists:', !!localStorage.getItem('token'));

      // Fetch stats
      const statsResponse = await userService.getUserStats();
      console.log('📊 Stats response:', statsResponse);
      if (statsResponse && statsResponse.success) {
        setStats(statsResponse.data);
        console.log('✅ Stats loaded:', statsResponse.data);
      } else {
        console.warn('⚠️ Stats API returned unsuccessful:', statsResponse);
      }

      // Fetch users with current filters
      const usersResponse = await userService.getUsers({
        page: currentPage,
        per_page: itemsPerPage,
        search: searchQuery,
        role: roleFilter === 'all' ? 'all' : roleFilter
      });

      console.log('👥 Users response:', usersResponse);

      // Check if response has success property
      if (usersResponse && usersResponse.success) {
        setUsers(usersResponse.data.users);
        setPagination(usersResponse.data.pagination);
        setErrorMessage('');
        console.log('✅ Users loaded successfully:', usersResponse.data.users.length, 'items');
      } else {
        console.warn('⚠️ Users API returned unsuccessful:', usersResponse);
        console.warn('⚠️ Response structure:', usersResponse);
        setUsers([]);
        setPagination({ total: 0, per_page: itemsPerPage, total_pages: 0 });
        setErrorMessage('Gagal mengambil data pengguna.');
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      console.error('❌ Error details:', error?.response);
      setUsers([]);
      setPagination({ total: 0, per_page: itemsPerPage, total_pages: 0 });
      setErrorMessage(error?.response?.data?.message || 'Gagal mengambil data pengguna.');
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

  const handleDeleteUser = (id) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setUserToDelete(user);
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      setErrorMessage('');
      await userService.deleteUser(userToDelete.id);

      // Refresh data
      await fetchData();

      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      setErrorMessage(error?.message || 'Gagal menghapus pengguna.');
      setShowDeleteModal(false);
      setUserToDelete(null);
    } finally {
      setIsDeleting(false);
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
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 px-8 py-6 h-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <button 
                  onClick={toggleSidebar}
                  className="p-2 bg-gray-50 rounded-lg lg:hidden hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <FiMenu size={20} />
                </button>
                <FiUsers className="text-blue-600" /> Manajemen Pengguna
              </h1>
              <p className="text-gray-500 text-[10px] sm:text-sm mt-1 font-medium italic">
                Kelola data pengguna sistem pelaporan PolijeCare
              </p>
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

          {/* Premium Table Section */}
          <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            {/* Header Toolbar */}
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Direktori Pengguna</h2>
                <p className="text-gray-500 text-sm mt-1 font-medium">
                  Menampilkan <span className="text-gray-900">{users.length}</span> dari {pagination.total} pengguna
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Role Filter */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFilter className="text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                  </div>
                  <select
                    className="pl-9 pr-8 py-2.5 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:ring-gray-300 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">Semua Peran</option>
                    <option value="konselor">Konselor</option>
                    <option value="operator">Operator</option>
                    <option value="user">Pengguna</option>
                  </select>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2 bg-gray-50 p-1 ring-1 ring-gray-200 rounded-xl">
                  <button
                    onClick={exportCsv}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all"
                  >
                    <FiDownload size={14} />
                    <span className="hidden sm:inline font-medium">CSV</span>
                  </button>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <button
                    onClick={printTable}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all"
                  >
                    <FiPrinter size={14} />
                    <span className="hidden sm:inline font-medium">Cetak</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Pengguna</th>
                    <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase hidden md:table-cell">Kontak & Status</th>
                    <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Peran</th>
                    <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase hidden lg:table-cell">Identitas</th>
                    <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    // Premium Skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse bg-white">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-24 bg-gray-200 rounded"></div>
                              <div className="h-3 w-16 bg-gray-100 rounded"></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell">
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="h-4 w-20 bg-gray-100 rounded-full"></div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-6 w-20 bg-gray-200 rounded-lg"></div>
                        </td>
                        <td className="py-4 px-6 hidden lg:table-cell">
                          <div className="space-y-2">
                            <div className="h-4 w-20 bg-gray-200 rounded"></div>
                            <div className="h-3 w-16 bg-gray-100 rounded"></div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-xl"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded-xl"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="group bg-white hover:bg-slate-50/80 transition-all duration-300"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all duration-300">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${user.email_verified_at ? 'bg-emerald-400' : 'bg-amber-400'} shadow-sm`}></div>
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{user.name}</div>
                              <div className="text-[11px] font-medium text-gray-400 mt-0.5">ID: #{user.id}</div>
                              {/* Mobile email fallback */}
                              <div className="text-[11px] text-gray-500 md:hidden mt-0.5 truncate max-w-[150px]">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                              {user.email}
                            </span>
                            {user.email_verified_at ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit border border-emerald-200/50">
                                <FiCheckCircle size={10} /> TERVERIFIKASI
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md w-fit border border-amber-200/50">
                                <FiAlertCircle size={10} /> BELUM VERIFIKASI
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-widest border ${user.role === 'konselor' ? 'bg-blue-50/50 text-blue-600 border-blue-200' :
                            user.role === 'operator' ? 'bg-indigo-50/50 text-indigo-600 border-indigo-200' :
                              'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 hidden lg:table-cell">
                          <div className="text-sm font-semibold text-gray-800">{user.nim || '-'}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5 block">Tergabung: {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button
                              onClick={() => handleEditUser(user.id)}
                              className="p-2 sm:p-2.5 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 group-hover:duration-300"
                              title="Edit Pengguna"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 sm:p-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 group-hover:duration-300"
                              title="Hapus Pengguna"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-16 text-center">
                        <div className="inline-flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-gray-100">
                            <FiUsers className="text-3xl text-gray-400" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">Pengguna Tidak Ditemukan</h3>
                          <p className="text-sm text-gray-500 max-w-sm">Kami tidak dapat menemukan pengguna yang sesuai dengan kriteria filter Anda saat ini.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Component (Premium) */}
            {!isLoading && users.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-sm font-medium text-gray-500">
                  Menampilkan <span className="text-gray-900 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, pagination.total)}</span> dari <span className="text-gray-900 font-bold">{pagination.total}</span> pengguna
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-fit">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  >
                    <FiChevronLeft size={16} />
                  </button>

                  <div className="flex items-center">
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
                          className={`min-w-[32px] h-8 px-2 mx-0.5 rounded-lg text-sm font-bold transition-all ${currentPage === pageNum
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  >
                    <FiChevronRight size={16} />
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
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !isDeleting && setShowDeleteModal(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-600"></div>
              <div className="flex flex-col items-center text-center mt-4">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 ring-8 ring-rose-50">
                  <FiAlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Pengguna</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Apakah Anda yakin ingin menghapus pengguna <br />
                  <span className="font-bold text-gray-800">{userToDelete?.name}</span>?
                  <br /><span className="text-rose-500 font-medium">Tindakan ini tidak dapat dibatalkan.</span>
                </p>

                <div className="flex justify-center gap-3 w-full">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium hover:from-rose-600 hover:to-red-700 focus:ring-4 focus:ring-rose-100 hover:shadow-lg hover:shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="ml-2">Menghapus...</span>
                      </>
                    ) : (
                      <>
                        <FiTrash2 size={18} />
                        <span>Ya, Hapus</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserManagementPage;
