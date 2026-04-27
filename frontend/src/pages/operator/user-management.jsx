import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import {
  FiUsers, FiUserPlus, FiSearch, FiFilter, FiEdit, FiTrash2,
  FiCheckCircle, FiAlertCircle, FiDownload, FiPrinter,
  FiUser, FiMessageSquare, FiChevronLeft, FiChevronRight, FiEye, FiEyeOff, FiMenu,
  FiMoreVertical, FiTrendingUp, FiLoader, FiX, FiShield, FiSave
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { userService } from '../../services/userService';

const UserManagementPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
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
    per_page: 8,
    total_pages: 1
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
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

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const statsData = [
    { title: 'Total User', value: stats.total_users || 0, icon: <FiUsers />, color: 'bg-indigo-600', shadow: 'shadow-indigo-200 dark:shadow-indigo-900/20' },
    { title: 'Operator', value: stats.operator || 0, icon: <FiShield />, color: 'bg-emerald-600', shadow: 'shadow-emerald-200 dark:shadow-emerald-900/20' },
    { title: 'Konselor', value: stats.konselor || 0, icon: <FiMessageSquare />, color: 'bg-blue-600', shadow: 'shadow-blue-200 dark:shadow-blue-900/20' },
    { title: 'Pengguna', value: stats.pengguna || 0, icon: <FiUser />, color: 'bg-rose-600', shadow: 'shadow-rose-200 dark:shadow-rose-900/20' },
  ];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const statsResponse = await userService.getUserStats();
      if (statsResponse?.success) setStats(statsResponse.data);

      const usersResponse = await userService.getUsers({
        page: currentPage,
        per_page: pagination.per_page,
        search: searchQuery,
        role: roleFilter === 'all' ? 'all' : roleFilter
      });

      if (usersResponse?.success) {
        setUsers(usersResponse.data.users);
        setPagination(usersResponse.data.pagination);
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Gagal mengambil data pengguna.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery, roleFilter]);

  const handleAddUser = () => {
    setModalMode('create');
    setSelectedUser(null);
    setFormError('');
    setFormData({ name: '', email: '', password: '', role: 'user', nim: '' });
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
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

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      await userService.deleteUser(userToDelete.id);
      await fetchData();
      setShowDeleteModal(false);
    } catch (error) {
      setErrorMessage('Gagal menghapus pengguna.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Nama dan Email wajib diisi'); return;
    }
    if (modalMode === 'create' && !formData.password) {
      setFormError('Password wajib diisi'); return;
    }

    try {
      setIsSubmitting(true);
      const payload = { ...formData, nim: formData.nim?.trim() || null };
      if (modalMode === 'create') {
        await userService.createUser(payload);
      } else {
        if (!formData.password) delete payload.password;
        await userService.updateUser(selectedUser.id, payload);
      }
      setShowUserModal(false);
      fetchData();
    } catch (error) {
      setFormError(error?.message || 'Gagal menyimpan pengguna.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCsv = () => {
    const headers = ['ID', 'Nama', 'Email', 'Role', 'NIM'];
    const csv = [headers, ...users.map(u => [u.id, u.name, u.email, u.role, u.nim || ''])].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'users.csv'; a.click();
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-['Poppins'] overflow-hidden transition-colors duration-500">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>

      <div className="flex-none h-full overflow-y-auto no-scrollbar border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all">
        <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 px-4 md:px-8 py-4 md:py-6 shrink-0 z-30 transition-all">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button onClick={toggleSidebar} className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl lg:hidden hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
                <FiMenu size={20} className="dark:text-white" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                  <FiUsers className="text-indigo-600 dark:text-indigo-400" /> Manajemen Pengguna
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Direktori & Akses Kontrol PolijeCare</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
               <div className="relative w-full sm:w-64 group">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 transition-all" />
                  <input type="text" placeholder="Cari..." value={searchQuery} onChange={e => { setCurrentPage(1); setSearchQuery(e.target.value); }}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl text-[11px] font-bold text-slate-900 outline-none transition-all shadow-inner" />
               </div>
               <button onClick={handleAddUser} className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                 <FiUserPlus size={18} /> Tambah
               </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/50 custom-scrollbar transition-all">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:shadow-xl transition-all group overflow-hidden relative">
                 <div className={`p-4 ${stat.color} text-white rounded-2xl shadow-xl transition-transform group-hover:scale-110`}>
                   {React.cloneElement(stat.icon, { size: 24 })}
                 </div>
                 <div className="relative z-10">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                   <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                 </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-all">
            <div className="px-8 py-6 border-b border-gray-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30 dark:bg-slate-800/30">
               <div>
                 <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">Direktori Pengguna</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total {pagination.total} Entri</p>
               </div>
               <div className="flex items-center gap-3">
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                    className="px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 outline-none focus:border-indigo-500 cursor-pointer shadow-sm">
                    <option value="all">Semua Peran</option>
                    <option value="konselor">Konselor</option>
                    <option value="operator">Operator</option>
                    <option value="user">User</option>
                  </select>
                  <button onClick={exportCsv} className="p-2.5 bg-white border border-gray-100 rounded-xl text-slate-400 hover:text-emerald-500 transition-all shadow-sm">
                    <FiDownload size={18} />
                  </button>
               </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-950/50">
                  <tr>
                    <th className="py-5 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pengguna</th>
                    <th className="py-5 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role & Akses</th>
                    <th className="py-5 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identitas</th>
                    <th className="py-5 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="4" className="py-8 px-8"><div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full" /></td>
                      </tr>
                    ))
                  ) : users.map(user => (
                    <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-base shadow-inner border border-gray-200/50 group-hover:scale-110 transition-all">
                            {user.name[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{user.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                         <span className={`px-3 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-widest ${
                           user.role === 'operator' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                           user.role === 'konselor' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                           'bg-slate-100 text-slate-600 border-slate-200'
                         }`}>
                           {user.role}
                         </span>
                      </td>
                      <td className="py-6 px-8">
                         <p className="text-xs font-bold text-slate-700 tracking-tight">{user.nim || 'N/A'}</p>
                         <p className="text-[10px] text-slate-400 uppercase font-medium mt-1 tracking-widest">{new Date(user.created_at).toLocaleDateString('id-ID')}</p>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => handleEditUser(user)} className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all active:scale-95"><FiEdit size={16} /></button>
                           <button onClick={() => handleDeleteUser(user)} className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-400 hover:text-rose-600 rounded-xl transition-all active:scale-95"><FiTrash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-5 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between bg-gray-50/30 dark:bg-slate-950/50">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Halaman {currentPage} dari {pagination.total_pages}</p>
               <div className="flex gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg disabled:opacity-30 transition-all"><FiChevronLeft /></button>
                  <button disabled={currentPage === pagination.total_pages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg disabled:opacity-30 transition-all"><FiChevronRight /></button>
               </div>
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showUserModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 dark:bg-slate-950/80 transition-all">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
               <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
               <div className="px-10 py-8 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{modalMode === 'create' ? 'Tambah Pengguna' : 'Edit Pengguna'}</h3>
                  <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-rose-600 transition-colors"><FiX size={24} /></button>
               </div>
               <form onSubmit={handleSubmitUser} className="p-10 space-y-6">
                  {formError && <div className="p-4 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase rounded-2xl border border-rose-100">{formError}</div>}
                  <div className="grid grid-cols-2 gap-6">
                     <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Nama Lengkap</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-inner" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Email</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-inner" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Peran</label>
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-inner">
                           <option value="user">User</option>
                           <option value="konselor">Konselor</option>
                           <option value="operator">Operator</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">NIM / Identitas</label>
                        <input type="text" value={formData.nim} onChange={e => setFormData({...formData, nim: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-inner" />
                     </div>
                     <div className="space-y-2 relative">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Password</label>
                        <input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-transparent dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-inner" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-[48px] text-slate-400 hover:text-indigo-600 transition-all">{showPassword ? <FiEyeOff size={18}/> : <FiEye size={18}/>}</button>
                     </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                     <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Batal</button>
                     <button type="submit" disabled={isSubmitting} className="flex-[2] py-5 bg-indigo-600 text-white font-bold rounded-full text-[10px] tracking-widest shadow-xl shadow-indigo-100 uppercase">{isSubmitting ? <FiLoader className="animate-spin mx-auto"/> : <><FiSave className="inline mr-2"/> Simpan</>}</button>
                  </div>
               </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 dark:bg-slate-950/80 transition-all">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 max-w-sm text-center border border-gray-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
               <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-rose-600"><FiTrash2 size={32} /></div>
               <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight mb-2">Hapus User?</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10 opacity-70">Aksi ini tidak dapat dibatalkan</p>
               <div className="flex gap-4">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Batal</button>
                  <button onClick={confirmDeleteUser} disabled={isDeleting} className="flex-[2] py-4 bg-rose-600 text-white font-bold rounded-full text-[10px] tracking-widest shadow-xl shadow-rose-100 uppercase">Hapus</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagementPage;
