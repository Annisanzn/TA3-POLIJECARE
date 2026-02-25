import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiFileText, FiLink, FiEye, FiDownload, FiFile, FiUpload, FiExternalLink, FiAlertCircle, FiCheck, FiFilter } from 'react-icons/fi';
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
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {isLoading ? (
              <div className="p-8">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : materials.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiFile className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada materi</h3>
                <p className="text-gray-500 mb-4">Mulai dengan menambahkan materi pertama</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Tambah Materi
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Judul Materi
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipe
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File/Link
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploader
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {materials.map((material, index) => (
                        <motion.tr
                          key={material.unique_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-purple-600 font-medium">
                              {material.unique_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{material.judul}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {material.kategori}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${material.tipe === 'file'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                              }`}>
                              {material.tipe === 'file' ? 'File' : 'Link'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => viewMaterial(material)}
                                className="flex items-center gap-1.5 text-purple-600 hover:text-purple-800 transition-colors bg-purple-50 px-3 py-1.5 rounded-lg text-sm font-medium"
                              >
                                {material.tipe === 'file' ? (
                                  <><FiEye className="w-4 h-4" /> Buka</>
                                ) : (
                                  <><FiExternalLink className="w-4 h-4" /> Buka Link</>
                                )}
                              </button>
                              {material.tipe === 'file' && (
                                <button
                                  onClick={() => downloadMaterial(material)}
                                  className="flex items-center gap-1.5 text-green-600 hover:text-green-800 transition-colors bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium"
                                  title="Download File"
                                >
                                  <FiDownload className="w-4 h-4" /> Unduh
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{material.uploader?.name}</div>
                            <div className="text-xs text-gray-500">{material.uploader?.role}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(material.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openFile(material)}
                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                title="Lihat"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedMaterial(material);
                                  setShowDeleteModal(true);
                                }}
                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                title="Hapus"
                              >
                                <FiTrash2 className="w-4 h-4" />
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
          </motion.div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex items-center justify-between"
            >
              <div className="text-sm text-gray-700">
                Menampilkan {((currentPage - 1) * itemsPerPage) + 1} hingga{' '}
                {Math.min(currentPage * itemsPerPage, pagination.total)} dari {pagination.total} materi
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  {currentPage} / {pagination.total_pages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.total_pages, prev + 1))}
                  disabled={currentPage === pagination.total_pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
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
              className="bg-white rounded-xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Hapus Materi</h2>
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus materi "{selectedMaterial.judul}"?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDeleteMaterial}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Menghapus...' : 'Hapus'}
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
