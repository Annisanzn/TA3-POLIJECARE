import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { articleService } from '../services/articleService';

/* ─── Reading Progress Bar ─────────────────────────────────────────────────── */
const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setProgress(Math.min(100, Math.max(0, pct)));
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
      <div
        className="h-full transition-all duration-75 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
        }}
      />
    </div>
  );
};

/* ─── Skeleton Loader ───────────────────────────────────────────────────────── */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const ArticleDetailSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Hero skeleton */}
    <Skeleton className="w-full h-80 sm:h-[28rem] rounded-none" />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="border-t pt-8 space-y-3">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className={`h-4 w-${i % 2 === 0 ? 'full' : '4/5'}`} />)}
      </div>
    </div>
  </div>
);

/* ─── Format helpers ─────────────────────────────────────────────────────────── */
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

const readTime = (content = '') => {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

/* ─── Navbar ─────────────────────────────────────────────────────────────────── */
const ReadingNav = ({ title, scrolled }) => (
  <header
    className={`fixed top-1 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
  >
    <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <Link
        to="/#articles"
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </Link>
      {scrolled && (
        <p className="text-sm font-medium text-gray-800 truncate max-w-xs hidden sm:block">
          {title}
        </p>
      )}
      <div className="flex items-center gap-1">
        <Link
          to="/"
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          PolijeCare
        </Link>
      </div>
    </div>
  </header>
);

/* ─── Main Component ─────────────────────────────────────────────────────────── */
const ArticleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArt] = useState(null);
  const [loading, setLoad] = useState(true);
  const [error, setErr] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetch = async () => {
      setLoad(true);
      setErr(null);
      try {
        const res = await articleService.getBySlug(slug);
        if (res.success && res.data) {
          setArt(res.data);
        } else {
          setErr('Artikel tidak ditemukan');
        }
      } catch {
        setErr('Gagal memuat artikel. Periksa koneksi Anda.');
      } finally {
        setLoad(false);
      }
    };
    fetch();
  }, [slug]);

  /* ── Loading ── */
  if (loading) return (
    <>
      <ReadingProgress />
      <ArticleDetailSkeleton />
    </>
  );

  /* ── Error / Not Found ── */
  if (error || !article) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Artikel Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8">{error || 'Artikel yang Anda cari tidak tersedia atau sudah dihapus.'}</p>
        <Link
          to="/#articles"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          ← Kembali ke Artikel
        </Link>
      </div>
    </div>
  );

  const mins = readTime(article.content);

  return (
    <>
      <ReadingProgress />
      <ReadingNav title={article.title} scrolled={scrolled} />

      <main className="min-h-screen bg-white">
        {/* ── HERO IMAGE ── */}
        <div className="relative w-full h-72 sm:h-96 lg:h-[28rem] overflow-hidden bg-gray-900">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover opacity-80"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            // Fallback gradient hero
            <div className="w-full h-full bg-gradient-to-br from-indigo-800 via-purple-800 to-indigo-900" />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Title over hero */}
          <div className="absolute inset-x-0 bottom-0 px-6 pb-8 sm:px-10 max-w-3xl mx-auto">
            {/* Category badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/80 backdrop-blur-sm text-white text-xs font-semibold mb-4">
              📋 Artikel & Pengumuman
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              {article.title}
            </h1>
          </div>
        </div>

        {/* ── ARTICLE BODY ── */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-4 py-6 border-b border-gray-100 text-sm text-gray-500">
            {/* Date */}
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {fmtDate(article.published_at || article.created_at)}
            </div>
            {/* Read time */}
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {mins} menit baca
            </div>
            {/* Author */}
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              Satgas PPKPT Polije
            </div>
          </div>

          {/* Excerpt / Lead */}
          {article.excerpt && (
            <p className="mt-8 text-lg sm:text-xl text-gray-600 leading-relaxed font-light border-l-4 border-indigo-400 pl-5 italic">
              {article.excerpt}
            </p>
          )}

          {/* Article Content */}
          <div
            className="mt-8 pb-16 prose-article"
            style={{
              color: '#374151',
              lineHeight: '1.9',
              fontSize: '1.0625rem',
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* ── DIVIDER ── */}
          <div className="border-t border-gray-100 pt-8 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              {/* Share */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Bagikan artikel ini:</p>
                <div className="flex gap-2">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                    title="Bagikan ke Facebook"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                    title="Bagikan ke WhatsApp"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                  <button
                    onClick={() => { navigator.clipboard.writeText(window.location.href); }}
                    className="w-9 h-9 bg-gray-700 text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
                    title="Salin tautan"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Back button */}
              <Link
                to="/#articles"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke Artikel
              </Link>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="bg-gray-50 border-t border-gray-100 py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">PC</span>
              </div>
              <span className="font-semibold text-gray-800">PolijeCare</span>
            </Link>
            <p className="text-sm text-gray-400">
              Satgas PPKPT Politeknik Negeri Jember — Artikel & Pengumuman
            </p>
          </div>
        </footer>
      </main>

      {/* ── Inline styles for article prose ── */}
      <style>{`
        .prose-article h1, .prose-article h2, .prose-article h3 {
          font-weight: 700; color: #111827; margin-top: 2em; margin-bottom: 0.75em;
        }
        .prose-article h2 { font-size: 1.375rem; }
        .prose-article h3 { font-size: 1.125rem; }
        .prose-article p  { margin-bottom: 1.25em; }
        .prose-article ul, .prose-article ol { padding-left: 1.5rem; margin-bottom: 1.25em; }
        .prose-article li { margin-bottom: 0.4em; }
        .prose-article ul { list-style-type: disc; }
        .prose-article ol { list-style-type: decimal; }
        .prose-article strong { font-weight: 600; color: #1f2937; }
        .prose-article a { color: #4f46e5; text-decoration: underline; }
        .prose-article a:hover { color: #4338ca; }
        .prose-article blockquote {
          border-left: 4px solid #818cf8; padding-left: 1rem; margin: 1.5rem 0;
          color: #4b5563; font-style: italic;
        }
        .prose-article img { max-width: 100%; border-radius: 0.75rem; margin: 1.5rem 0; }
      `}</style>
    </>
  );
};

export default ArticleDetail;
