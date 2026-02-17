import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeIn, slideUp } from '../utils/motionVariants';
import { Gallery4 } from './gallery4';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Temporary disable API calls to prevent CORS errors
    const mockArticles = [
      {
        id: 1,
        title: 'Guru Besar UGM Diduga Lakukan Kekerasan Seksual, Diberhentikan Sementara',
        slug: 'https://www.detik.com/jateng/berita/d-6204001/dugaan-kekerasan-seksual-guru-besar-ugm-dipecat-sebagai-dosen',
        image: 'https://images.unsplash.com/photo-1592280771800-45cb10bd3dcf?q=80&w=1740&auto=format&fit=crop',
        content: 'Universitas Gadjah Mada (UGM) mengambil tindakan tegas dengan memberhentikan sementara seorang guru besar yang diduga terlibat kasus kekerasan seksual.',
        is_published: true,
        published_at: '2025-01-20T00:00:00.000000Z'
      },
      {
        id: 2,
        title: 'Rektor Universitas Pancasila Nonaktif Jalani Pemeriksaan Kasus Pelecehan',
        slug: 'https://metro.tempo.co/read/1840000/kasus-pelecehan-seksual-rektor-universitas-pancasila',
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1740&auto=format&fit=crop',
        content: 'Polda Metro Jaya memeriksa Rektor Universitas Pancasila nonaktif terkait laporan dugaan pelecehan seksual terhadap pegawai kampus.',
        is_published: true,
        published_at: '2024-06-15T00:00:00.000000Z'
      },
      {
        id: 3,
        title: 'Unand Resmikan Satgas PPK, Perluas Cakupan Penanganan Kekerasan',
        slug: 'https://www.unand.ac.id/id/berita-peristiwa/berita/item/5799-resmikan-satgas-ppk-rektor-unand-kawal-kampus-aman.html',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1740&auto=format&fit=crop',
        content: 'Universitas Andalas meresmikan Satuan Tugas Pencegahan dan Penanganan Kekerasan (PPK) untuk menciptakan lingkungan kampus yang aman dan inklusif.',
        is_published: true,
        published_at: '2024-11-10T00:00:00.000000Z'
      },
      {
        id: 4,
        title: 'Mahasiswa Unsri Tuntut Penuntasan Kasus Pelecehan Seksual',
        slug: 'https://www.cnnindonesia.com/nasional/20211203145209-12-729000/mahasiswa-unsri-demo-tuntut-usut-tuntas-dugaan-pelecehan-seksual',
        image: 'https://images.unsplash.com/photo-1555848960-8c3af5e4860c?q=80&w=1740&auto=format&fit=crop',
        content: 'Ratusan mahasiswa Universitas Sriwijaya menggelar aksi damai menuntut pengusutan tuntas kasus dugaan pelecehan seksual oleh oknum dosen.',
        is_published: true,
        published_at: '2024-10-05T00:00:00.000000Z'
      },
      {
        id: 5,
        title: 'Kemendikbudristek Cabut Izin Kampus yang Abaikan Kasus Kekerasan Seksual',
        slug: 'https://nasional.kompas.com/read/2023/06/07/11261391/izin-23-perguruan-tinggi-dicabut-ada-kampus-yang-abaikan-kasus-kekerasan',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1740&auto=format&fit=crop',
        content: 'Kemendikbudristek mengambil langkah tegas mencabut izin operasional perguruan tinggi yang terbukti melakukan pelanggaran berat, termasuk pembiaran kekerasan seksual.',
        is_published: true,
        published_at: '2024-02-01T00:00:00.000000Z'
      },
      {
        id: 6,
        title: 'Puan Maharani: Kampus Harus Jadi Ruang Aman Bebas Kekerasan Seksual',
        slug: 'https://www.dpr.go.id/berita/detail/id/35000/t/Ketua+DPR+Minta+Kampus+Jadi+Ruang+Aman+dari+Kekerasan+Seksual',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1740&auto=format&fit=crop',
        content: 'Ketua DPR RI Puan Maharani menegaskan pentingnya komitmen perguruan tinggi dalam menciptakan ruang aman bebas dari segala bentuk kekerasan seksual.',
        is_published: true,
        published_at: '2024-09-15T00:00:00.000000Z'
      },
      {
        id: 7,
        title: 'Komnas Perempuan: Kekerasan Seksual di Lingkungan Pendidikan Masih Mengkhawatirkan',
        slug: 'https://www.kompas.id/baca/humaniora/2024/03/07/kekerasan-seksual-di-lingkungan-pendidikan-masih-tinggi',
        image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1740&auto=format&fit=crop',
        content: 'Komnas Perempuan mencatat angka kekerasan seksual di lingkungan pendidikan masih tinggi dan memerlukan penanganan sistemik yang lebih serius.',
        is_published: true,
        published_at: '2024-03-08T00:00:00.000000Z'
      },
      {
        id: 8,
        title: 'Pentingnya Pendidikan Seksual di Kampus untuk Cegah Tindakan Asusila',
        slug: 'https://edukasi.kompas.com/read/2021/11/12/100000371/pentingnya-pendidikan-seksual-sejak-dini-untuk-cegah-pelecehan',
        image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1740&auto=format&fit=crop',
        content: 'Pendidikan seksual yang komprehensif di lingkungan kampus dinilai efektif sebagai langkah preventif untuk mencegah terjadinya tindak asusila.',
        is_published: true,
        published_at: '2024-01-10T00:00:00.000000Z'
      }
    ];

    setArticles(mockArticles);
    setLoading(false);
  }, []);

  const galleryItems = articles.map(article => ({
    id: article.id.toString(),
    title: article.title,
    description: article.content,
    href: article.slug,
    image: article.image
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
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative z-10">
        {loading && (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-32 text-red-500 max-w-lg mx-auto px-4">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
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
