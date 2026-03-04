import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiCheck, FiAlertCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';
import violenceCategoryService from '../../services/violenceCategoryService';

const ViolenceCategoriesManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    total_pages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, [currentPage, itemsPerPage, searchQuery]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      console.log('🔍 Fetching categories data...');

      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchQuery,
      };

      console.log('📤 Request params:', params);
      console.log('🔑 Token exists:', !!localStorage.getItem('token'));

      const response = await violenceCategoryService.getCategories(params);
      console.log('✅ Categories API Response:', response);

      // API returns {categories: [...], pagination: {...}} directly
      if (response && response.categories) {
        setCategories(response.categories);
        setPagination(response.pagination);
        setErrorMessage('');
        console.log('✅ Categories loaded successfully:', response.categories.length, 'items');
      } else {
        console.error('❌ Invalid response structure:', response);
        setCategories([]);
        setPagination({ total: 0, per_page: itemsPerPage, total_pages: 0 });
        setErrorMessage('Gagal mengambil data kategori.');
      }
    } catch (error) {
      console.error('❌ Categories API Error:', error);
      console.error('❌ Error details:', error?.response);
      setCategories([]);
      setPagination({ total: 0, per_page: itemsPerPage, total_pages: 0 });
      setErrorMessage(error?.response?.data?.message || 'Gagal mengambil data kategori.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await violenceCategoryService.createCategory(formData);
      console.log('Create Category Response:', response);

      if (response && response.success === true) {
        setSuccessMessage('Kategori berhasil ditambahkan!');
        setShowAddModal(false);
        resetForm();
        fetchCategories();
      } else {
        const errorMessage = response?.message ||
          response?.data?.message ||
          response?.error ||
          'Gagal menambahkan kategori.';
        setErrorMessage(errorMessage);
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Gagal menambahkan kategori.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await violenceCategoryService.updateCategory(selectedCategory.unique_id, formData);
      console.log('Update Category Response:', response);

      if (response && response.success === true) {
        setSuccessMessage('Kategori berhasil diperbarui!');
        setShowEditModal(false);
        resetForm();
        fetchCategories();
      } else {
        const errorMessage = response?.message ||
          response?.data?.message ||
          response?.error ||
          'Gagal memperbarui kategori.';
        setErrorMessage(errorMessage);
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Gagal memperbarui kategori.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await violenceCategoryService.deleteCategory(selectedCategory.unique_id);
      console.log('Delete Category Response:', response);

      if (response && response.success === true) {
        setSuccessMessage('Kategori berhasil dihapus!');
        setShowDeleteModal(false);
        setSelectedCategory(null);
        fetchCategories();
      } else {
        const errorMessage = response?.message ||
          response?.data?.message ||
          response?.error ||
          'Gagal menghapus kategori.';
        setErrorMessage(errorMessage);
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Gagal menghapus kategori.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manajemen Kategori Kekerasan</h1>
              <p className="text-gray-600 mt-1">Kelola kategori kekerasan untuk sistem pelaporan</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-x-auto">

          {/* Search and Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Tambah Kategori
              </motion.button>
            </div>
          </motion.div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700"
              >
                <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                {errorMessage}
                <button
                  onClick={() => setErrorMessage('')}
                  className="ml-auto hover:bg-red-100 p-1 rounded"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700"
              >
                <FiCheck className="w-5 h-5 flex-shrink-0" />
                {successMessage}
                <button
                  onClick={() => setSuccessMessage('')}
                  className="ml-auto hover:bg-green-100 p-1 rounded"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden relative"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            {isLoading ? (
              <div className="p-8">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex gap-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                  <FiAlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada kategori</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Mulai dengan menambahkan kategori kekerasan untuk mengelompokkan laporan.</p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center gap-2 mx-auto"
                >
                  <FiPlus className="w-5 h-5" />
                  Tambah Kategori
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase">ID</th>
                      <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Kategori</th>
                      <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase text-center">Jumlah Laporan</th>
                      <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase hidden md:table-cell">Tanggal Dibuat</th>
                      <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <AnimatePresence>
                      {categories.map((category, index) => (
                        <motion.tr
                          key={category.unique_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="group bg-white hover:bg-slate-50/80 transition-all duration-300"
                        >
                          <td className="py-4 px-6">
                            <div className="text-xs font-mono font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md inline-block">
                              {category.unique_id}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                <FiAlertCircle size={20} />
                              </div>
                              <div className="min-w-0 pr-4">
                                <div className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">{category.name}</div>
                                <div className="text-[11px] text-gray-500 mt-1 line-clamp-2">{category.description || '-'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center justify-center min-w-[2rem] px-2.5 py-1 rounded-lg text-xs font-bold ${category.complaints_count > 0
                                ? 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}>
                              {category.complaints_count || 0}
                            </span>
                          </td>
                          <td className="py-4 px-6 hidden md:table-cell">
                            <div className="text-sm font-medium text-gray-800">
                              {formatDate(category.created_at)}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(category)}
                                className="p-2 sm:p-2.5 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 group-hover:duration-300"
                                title="Edit Kategori"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(category)}
                                className="p-2 sm:p-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 group-hover:duration-300 delay-75"
                                title="Hapus Kategori"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination (Premium) */}
            {!isLoading && pagination.total > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-sm font-medium text-gray-500">
                  Menampilkan <span className="text-gray-900 font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> hingga <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, pagination.total)}</span> dari <span className="text-gray-900 font-bold">{pagination.total}</span> kategori
                </div>
                {pagination.total_pages > 1 && (
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-fit">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <FiChevronLeft size={16} />
                    </button>

                    <div className="flex items-center">
                      {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                        let n;
                        if (pagination.total_pages <= 5) n = i + 1;
                        else if (currentPage <= 3) n = i + 1;
                        else if (currentPage >= pagination.total_pages - 2) n = pagination.total_pages - 4 + i;
                        else n = currentPage - 2 + i;
                        return (
                          <button
                            key={n}
                            onClick={() => setCurrentPage(n)}
                            className={`min-w-[32px] h-8 px-2 mx-0.5 rounded-lg text-sm font-bold transition-all ${currentPage === n
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200'
                                : 'text-gray-600 hover:bg-gray-100'
                              }`}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(pagination.total_pages, prev + 1))}
                      disabled={currentPage === pagination.total_pages}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <FiChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Add Modal */}
          <AnimatePresence>
            {showAddModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowAddModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="bg-white rounded-xl p-6 w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Tambah Kategori</h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleAddCategory}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Kategori
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Contoh: Kekerasan Fisik"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tambahkan deskripsi kategori (opsional)"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {isLoading ? 'Menyimpan...' : 'Simpan'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Modal */}
          <AnimatePresence>
            {showEditModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowEditModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="bg-white rounded-xl p-6 w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Edit Kategori</h2>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleEditCategory}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Kategori
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Contoh: Kekerasan Fisik"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tambahkan deskripsi kategori (opsional)"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {isLoading ? 'Menyimpan...' : 'Simpan'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Modal */}
          <AnimatePresence>
            {showDeleteModal && selectedCategory && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                onClick={() => setShowDeleteModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-600"></div>
                  <div className="flex flex-col items-center text-center mt-4">
                    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 ring-8 ring-rose-50">
                      <FiAlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Hapus Kategori?
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                      Apakah Anda yakin ingin menghapus kategori <br />
                      <span className="font-bold text-gray-800">"{selectedCategory.name}"</span>?
                      <br /><span className="text-rose-500 font-medium">Tindakan ini tidak dapat dibatalkan.</span>
                    </p>
                    <div className="flex justify-center gap-3 w-full">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleDeleteCategory}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium hover:from-rose-600 hover:to-red-700 focus:ring-4 focus:ring-rose-100 hover:shadow-lg hover:shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {isLoading ? (
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
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ViolenceCategoriesManagement;
