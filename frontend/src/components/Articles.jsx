import React, { useState, useEffect } from 'react';
import { Gallery4 } from './gallery4';
import { articleService } from '../services/articleService';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await articleService.getAll();
        if (res.success) {
          setArticles(res.data || []);
        } else {
          setError('Gagal memuat artikel');
        }
      } catch (err) {
        console.error('Articles fetch error:', err);
        setError('Gagal memuat artikel');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const galleryItems = articles.map(article => ({
    id: article.id,
    title: article.title,
    description: article.excerpt || '',
    href: `/artikel/${article.slug}`,
    image: article.image || `https://picsum.photos/seed/${article.slug}/800/400.jpg`,
  }));

  const SectionTitle = (
    <span>
      Artikel & <span className="text-primary">Pengumuman</span>
    </span>
  );

  return (
    <div id="articles" className="bg-gray-50 dark:bg-gray-900 min-h-screen relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative z-10">
        {loading && (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-32 text-red-500 max-w-lg mx-auto px-4">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-32 text-gray-500 max-w-lg mx-auto px-4">
            <p className="text-lg font-medium">Belum ada artikel terbaru.</p>
            <p className="text-sm mt-2">Pantau terus halaman ini untuk informasi terkini dari PolijeCare.</p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <Gallery4
            title={SectionTitle}
            description="Dapatkan informasi terbaru seputar layanan, edukasi, dan pengumuman penting dari Satgas PPKPT Polije. Kami berkomitmen untuk transparansi dan edukasi."
            items={galleryItems}
          />
        )}
      </div>
    </div>
  );
};

export default Articles;
