import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiFileText, FiLink, FiEye, FiDownload, FiFile, FiUpload, FiExternalLink, FiAlertCircle, FiCheck, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';
import materialService from '../../services/materialService';
import violenceCategoryService from '../../services/violenceCategoryService';

const MaterialsManagement = () => {
  console.log('🚀 MaterialsManagement component rendering...');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [materials, setMaterials] = useState([]);
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
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [tipeFilter, setTipeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [violenceCategories, setViolenceCategories] = useState([]);

  console.log('📊 Current state:', {
    materialsCount: materials.length,
    isLoading,
    errorMessage,
    violenceCategoriesCount: violenceCategories.length
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    tipe: 'file',
    kategori: '',
    file: null,
    link: '',
  });

  const kategoriOptions = [
    'Modul Pelatihan',
    'Panduan Konseling',
    'Artikel',
    'Video Tutorial',
    'Template',
    'Lainnya',
    ...violenceCategories.map(cat => cat.name)
  ];

  useEffect(() => {
    fetchMaterials();
    fetchViolenceCategories();
  }, [currentPage, itemsPerPage, searchQuery, kategoriFilter, tipeFilter]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      console.log('🔍 Fetching materials data...');
      console.log('🔑 Token exists:', !!localStorage.getItem('token'));

      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchQuery,
        ...(kategoriFilter !== 'all' && { kategori: kategoriFilter }),
        ...(tipeFilter !== 'all' && { tipe: tipeFilter }),
      };

      console.log('📤 Request params:', params);

      const response = await materialService.getMaterials(params);
      console.log('✅ Materials API Response:', response);
      console.log('✅ Response type:', typeof response);
      console.log('✅ Response keys:', response ? Object.keys(response) : 'null');

      // API returns {materials: [...], pagination: {...}} directly
      if (response && response.materials) {
        setMaterials(response.materials);
        setPagination(response.pagination);
        setErrorMessage('');
        console.log('✅ Materials loaded successfully:', response.materials.length, 'items');
        console.log('✅ Sample material:', response.materials[0]);
      } else {
        console.error('❌ Invalid response structure:', response);
        setMaterials([]);
        setPagination({ total: 0, per_page: itemsPerPage, total_pages: 0 });
        setErrorMessage('Gagal mengambil data materi. Response tidak valid.');
      }
    } catch (error) {
      console.error('❌ Materials API Error:', error);
      console.error('❌ Error details:', error?.response);
      console.error('❌ Error message:', error?.message);
      setMaterials([]);
      setPagination({ total: 0, per_page: itemsPerPage, total_pages: 0 });
      setErrorMessage(error?.response?.data?.message || 'Gagal mengambil data materi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage('');

      const submitData = new FormData();
      submitData.append('judul', formData.judul);
      submitData.append('deskripsi', formData.deskripsi);
      submitData.append('tipe', formData.tipe);
      submitData.append('kategori', formData.kategori);

      if (formData.tipe === 'file' && formData.file) {
        submitData.append('file', formData.file);
      } else if (formData.tipe === 'link') {
        submitData.append('link', formData.link);
      }

      const response = await materialService.createMaterial(submitData);
      console.log('Create Material Response:', response);

      // Check if response has success field
      if (response && response.success === true) {
        setSuccessMessage('Materi berhasil ditambahkan!');
        setShowAddModal(false);
        resetForm();
        fetchMaterials();
      } else {
        console.error('Create Material Error:', response);
        // Handle different response formats
        const errorMessage = response?.message ||
          response?.data?.message ||
          response?.error ||
          'Gagal menambahkan materi.';
        setErrorMessage(errorMessage);
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Gagal menambahkan materi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) return;

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await materialService.deleteMaterial(selectedMaterial.unique_id);
      console.log('Delete Material Response:', response);

      if (response && response.success === true) {
        setSuccessMessage('Materi berhasil dihapus!');
        setShowDeleteModal(false);
        setSelectedMaterial(null);
        fetchMaterials();
      } else {
        const errorMessage = response?.message ||
          response?.data?.message ||
          response?.error ||
          'Gagal menghapus materi.';
        setErrorMessage(errorMessage);
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Gagal menghapus materi.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      judul: '',
      deskripsi: '',
      tipe: 'file',
      kategori: '',
      file: null,
      link: '',
    });
  };

  const fetchViolenceCategories = async () => {
    try {
      console.log('🔍 Fetching violence categories...');
      const response = await violenceCategoryService.getCategories();
      console.log('✅ Categories API Response:', response);
      console.log('✅ Categories type:', typeof response);
      console.log('✅ Categories keys:', response ? Object.keys(response) : 'null');

      if (response && response.categories) {
        setViolenceCategories(response.categories);
        console.log('✅ Violence categories loaded:', response.categories.length, 'items');
      } else {
        console.warn('⚠️ No categories in response:', response);
        setViolenceCategories([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch violence categories:', error);
      console.error('❌ Error details:', error?.response);
      setViolenceCategories([]);
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FiFile className="w-4 h-4" />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FiFile className="w-4 h-4 text-red-500" />;
    if (['doc', 'docx'].includes(ext)) return <FiFile className="w-4 h-4 text-blue-500" />;
    return <FiFile className="w-4 h-4" />;
  };

  const viewMaterial = (material) => {
    if (material.tipe === 'file') {
      const fileUrl = materialService.getFileUrl(material.file_path);
      window.open(fileUrl, '_blank');
    } else {
      window.open(material.link, '_blank');
    }
  };

  const downloadMaterial = (material) => {
    if (material.tipe === 'file') {
      const fileUrl = materialService.getFileUrl(material.file_path);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = material.judul;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manajemen Materi</h1>
              <p className="text-gray-600 mt-1">Kelola materi pelatihan dan panduan konseling</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-x-auto">

          {/* Alerts */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700"
              >
                <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage('')} className="ml-auto">
                  <FiX className="w-4 h-4" />
                </button>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700"
              >
                <FiCheck className="w-5 h-5 flex-shrink-0" />
                <span>{successMessage}</span>
                <button onClick={() => setSuccessMessage('')} className="ml-auto">
                  <FiX className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Materi</p>
                  <p className="text-2xl font-bold text-gray-800">{pagination.total}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiFile className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">File Upload</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {materials.filter(m => m.tipe === 'file').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiUpload className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Link</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {materials.filter(m => m.tipe === 'link').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiLink className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kategori</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {[...new Set(materials.map(m => m.kategori))].length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FiFilter className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari judul atau kategori..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={kategoriFilter}
                  onChange={(e) => setKategoriFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Semua Kategori</option>
                  {kategoriOptions.map((kat) => (
                    <option key={kat} value={kat}>{kat}</option>
                  ))}
                </select>
                <select
                  value={tipeFilter}
                  onChange={(e) => setTipeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="file">File</option>
                  <option value="link">Link</option>
                </select>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Tambah Materi
                </button>
              </div>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
            ) : materials.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                  <FiFile className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada materi</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Mulai dengan menambahkan materi pertama untuk bahan edukasi atau panduan.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all flex items-center gap-2 mx-auto"
                >
                  <FiPlus className="w-5 h-5" />
                  Tambah Materi
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase">ID</th>
                      <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Judul Materi</th>
                      <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Kategori & Tipe</th>
                      <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Uploader</th>
                      <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase hidden md:table-cell">Tanggal</th>
                      <th className="py-4 px-6 text-[11px] font-bold tracking-widest text-gray-400 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <AnimatePresence>
                      {materials.map((material, index) => (
                        <motion.tr
                          key={material.unique_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="group bg-white hover:bg-slate-50/80 transition-all duration-300"
                        >
                          <td className="py-4 px-6">
                            <div className="text-xs font-mono font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md inline-block">
                              {material.unique_id}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${material.tipe === 'file' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                {material.tipe === 'file' ? <FiFileText size={20} /> : <FiLink size={20} />}
                              </div>
                              <div className="min-w-0 pr-4">
                                <div className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">{material.judul}</div>
                                {material.deskripsi && (
                                  <div className="text-[11px] text-gray-500 mt-1 line-clamp-1">{material.deskripsi}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1.5 items-start">
                              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 rounded-md truncate max-w-[150px]" title={material.kategori}>
                                {material.kategori}
                              </span>
                              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${material.tipe === 'file'
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : 'bg-green-50 text-green-700 border border-green-100'
                                }`}>
                                {material.tipe === 'file' ? 'File Upload' : 'Tautan/Link'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {material.uploader?.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{material.uploader?.name || 'Administrator'}</div>
                                <div className="text-[11px] text-gray-500">{material.uploader?.role || 'Admin'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 hidden md:table-cell">
                            <div className="text-sm font-medium text-gray-800">
                              {new Date(material.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {material.tipe === 'file' && (
                                <button
                                  onClick={() => downloadMaterial(material)}
                                  className="p-2 sm:p-2.5 text-emerald-500 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 group-hover:duration-300"
                                  title="Download File"
                                >
                                  <FiDownload size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => viewMaterial(material)}
                                className="p-2 sm:p-2.5 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 group-hover:duration-300 delay-75"
                                title={material.tipe === 'file' ? "Buka Materi" : "Buka Link"}
                              >
                                {material.tipe === 'file' ? <FiEye size={16} /> : <FiExternalLink size={16} />}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedMaterial(material);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 sm:p-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 group-hover:duration-300 delay-100"
                                title="Hapus Materi"
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
                  Menampilkan <span className="text-gray-900 font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> hingga <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, pagination.total)}</span> dari <span className="text-gray-900 font-bold">{pagination.total}</span> materi
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
        </main>
      </div>

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
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Tambah Materi</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Materi
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.judul || ''}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    rows="3"
                    value={formData.deskripsi || ''}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Tambahkan deskripsi materi (opsional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    required
                    value={formData.kategori || ''}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Pilih Kategori</option>
                    {kategoriOptions.map((kat) => (
                      <option key={kat} value={kat}>{kat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe
                  </label>
                  <select
                    required
                    value={formData.tipe}
                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value, file: null, link: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="file">File Upload</option>
                    <option value="link">Link</option>
                  </select>
                </div>

                {formData.tipe === 'file' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File (PDF, DOC, DOCX - Max 5MB)
                    </label>
                    <input
                      key={formData.tipe === 'file' ? 'file-input' : 'link-input'}
                      type="file"
                      required={formData.tipe === 'file'}
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link URL
                    </label>
                    <input
                      key={formData.tipe === 'link' ? 'link-input' : 'file-input'}
                      type="url"
                      required={formData.tipe === 'link'}
                      value={formData.link || ''}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
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
        {showDeleteModal && selectedMaterial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-red-600"></div>
              <div className="flex flex-col items-center text-center mt-4">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 ring-8 ring-rose-50">
                  <FiAlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Materi?</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Apakah Anda yakin ingin menghapus materi <br />
                  <span className="font-bold text-gray-800">"{selectedMaterial.judul}"</span>?
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
                    onClick={handleDeleteMaterial}
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
    </div>
  );
};

export default MaterialsManagement;
