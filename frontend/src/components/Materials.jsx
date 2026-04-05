import React, { useState, useEffect } from 'react';
import { Gallery4 } from './gallery4';
import materialService from '../services/materialService';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const res = await materialService.getPublicMaterials();
        // Backend returns { materials: [], pagination: {} }
        if (res && res.materials) {
          setMaterials(res.materials || []);
        } else {
          setError('Gagal memuat materi');
        }
      } catch (err) {
        console.error('Materials fetch error:', err);
        setError('Gagal memuat materi');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const getPlaceholderImage = (category, index) => {
    const images = [
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000', // Study
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1000', // Books
      'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=1000', // Guide
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000', // Laptop/digital
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000', // Teamwork/Ed
    ];
    return images[index % images.length];
  };

  const galleryItems = materials.map((item, index) => ({
    id: item.unique_id,
    title: item.judul,
    description: item.deskripsi || 'Lihat materi selengkapnya di sini.',
    href: item.tipe === 'file' ? materialService.getFileUrl(item.file_path) : item.link,
    image: getPlaceholderImage(item.kategori, index),
  }));

  const SectionTitle = (
    <span>
      Materi & <span className="text-primary">Edukasi</span>
    </span>
  );

  return (
    <div id="materials" className="bg-white dark:bg-gray-950 py-24 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20 text-red-500 max-w-lg mx-auto px-4">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && materials.length === 0 && (
          <div className="text-center py-20 text-gray-500 max-w-lg mx-auto px-4">
            <p className="text-lg font-medium">Belum ada materi edukasi.</p>
            <p className="text-sm mt-2">Kami sedang menyiapkan materi berkualitas untuk Anda.</p>
          </div>
        )}

        {!loading && !error && materials.length > 0 && (
          <Gallery4
            title={SectionTitle}
            description="Pelajari berbagai materi edukasi, panduan, dan literasi seputar pencegahan serta penanganan kekerasan seksual untuk lingkungan kampus yang lebih aman."
            items={galleryItems}
          />
        )}
      </div>
    </div>
  );
};

export default Materials;
