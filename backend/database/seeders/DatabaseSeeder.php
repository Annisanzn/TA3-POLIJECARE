<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Article;
use App\Models\ContactInfo;
use App\Models\HeroSection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Hero Section
        HeroSection::create([
            'title' => 'Aman Bicara, Aman Melapor',
            'subtitle' => 'Satgas PPKPT Politeknik Negeri Jember',
            'description' => 'Kami siap mendengar dan membantu Anda dengan profesionalisme dan kerahasiaan terjamin. Setiap laporan akan ditangani dengan empati dan seksama.'
        ]);

        // Contact Info
        ContactInfo::create([
            'address' => 'Jl. Mastrip PO Box 164, Jember 68121, Jawa Timur, Indonesia',
            'phone' => '+62 331-123456',
            'email' => 'satgasppkpt@polije.ac.id',
            'instagram' => '@satgasppkpt_polije',
            'whatsapp' => '+6281234567890',
            'facebook' => 'SatgasPPKPTPolije',
            'twitter' => '@SatgasPPKPTPolije'
        ]);

        // Professional Articles
        $articles = [
            [
                'title' => 'Pentingnya Menjaga Lingkungan Kampus Aman dari Kekerasan Seksual',
                'slug' => 'pentingnya-menjaga-lingkungan-kampus-aman-dari-kekerasan-seksual',
                'image' => 'articles/safe-campus.jpg',
                'content' => '<p>Lingkungan kampus yang aman adalah hak setiap sivitas akademika. Satgas PPKPT Politeknik Negeri Jember berkomitmen untuk menciptakan suasana belajar yang bebas dari kekerasan seksual.</p><p>Kekerasan seksual dalam lingkungan kampus dapat berupa berbagai bentuk, mulai dari pelecehan verbal hingga kekerasan fisik. Penting bagi kita semua untuk mengenali tanda-tanda dan bagaimana cara melaporkannya.</p><p>Setiap individu berhak mendapatkan perlindungan dan rasa aman dalam menempuh pendidikan. Mari bersama-sama menjaga kampus kita sebagai tempat yang aman dan mendukung bagi semua.</p>',
                'is_published' => true,
                'published_at' => now()->subDays(7),
            ],
            [
                'title' => 'Prosedur Pelaporan Kasus Kekerasan Seksual di Polije',
                'slug' => 'prosedur-pelaporan-kasus-kekerasan-seksual-di-polije',
                'image' => 'articles/reporting-procedure.jpg',
                'content' => '<p>Prosedur pelaporan kasus kekerasan seksual di Politeknik Negeri Jember dirancang untuk memberikan kemudahan dan rasa aman bagi pelapor.</p><p><strong>Langkah 1:</strong> Hubungi Satgas PPKPT melalui WhatsApp atau datang langsung ke sekretariat.</p><p><strong>Langkah 2:</strong> Tim kami akan melakukan pendengaran awal dan memberikan informasi tentang hak-hak Anda.</p><p><strong>Langkah 3:</strong> Jika Anda setuju, kami akan membantu proses pelaporan formal.</p><p><strong>Langkah 4:</strong> Pendampingan psikologis dan hukum akan disediakan selama proses berlangsung.</p><p>Semua proses dijamin kerahasiaannya dan tidak akan ada diskriminasi terhadap pelapor.</p>',
                'is_published' => true,
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'Hak dan Kewajiban Korban dan Pelapor Kekerasan Seksual',
                'slug' => 'hak-dan-kewajiban-korban-dan-pelapor-kekerasan-seksual',
                'image' => 'articles/rights-responsibilities.jpg',
                'content' => '<p>Sebagai korban atau pelapor kekerasan seksual, Anda memiliki hak-hak yang dilindungi oleh undang-undang dan peraturan institusi.</p><p><strong>Hak-hak Anda:</strong></p><ul><li>Hak atas perlindungan dan keamanan</li><li>Hak atas kerahasiaan identitas</li><li>Hak mendapatkan pendampingan psikologis</li><li>Hak mendapatkan bantuan hukum</li><li>Hak bebas dari intimidasi dan ancaman</li></ul><p><strong>Kewajiban Anda:</strong></p><ul><li>Memberikan informasi yang akurat</li><li>Kooperatif dalam proses penanganan</li><li>Menghormati proses yang berlaku</li></ul>',
                'is_published' => true,
                'published_at' => now()->subDays(3),
            ],
            [
                'title' => 'Peran Satgas PPKPT dalam Mencegah Kekerasan Seksual',
                'slug' => 'peran-satgas-ppkpt-dalam-mencegah-kekerasan-seksual',
                'image' => 'articles/prevention-role.jpg',
                'content' => '<p>Satgas PPKPT Politeknik Negeri Jember memiliki peran penting dalam pencegahan dan penanganan kekerasan seksual di lingkungan kampus.</p><p><strong>Program Pencegahan:</strong></p><ul><li>Edukasi dan sosialisasi kepada sivitas akademika</li><li>Workshop dan pelatihan tentang konsen seksual</li><li>Kampanye anti-kekerasan seksual</li><li>Pembuatan kebijakan dan regulasi</li></ul><p><strong>Program Penanganan:</strong></p><ul><li>Penerimaan dan verifikasi laporan</li><li>Investigasi internal yang profesional</li><li>Pendampingan korban</li><li>Rekomendasi sanksi jika terbukti</li></ul>',
                'is_published' => true,
                'published_at' => now()->subDays(1),
            ],
            [
                'title' => 'Dukungan Psikologis bagi Korban Kekerasan Seksual',
                'slug' => 'dukungan-psikologis-bagi-korban-kekerasan-seksual',
                'image' => 'articles/psychological-support.jpg',
                'content' => '<p>Dampak psikologis kekerasan seksual dapat sangat berat bagi korban. Satgas PPKPT menyediakan layanan dukungan psikologis profesional.</p><p><strong>Layanan yang Tersedia:</strong></p><ul><li>Konseling individu dengan psikolog berpengalaman</li><li>Terapi kelompok jika diperlukan</li><li>Referensi ke psikiater jika ada indikasi medis</li><li>Dukungan selama proses hukum</li></ul><p><strong>Tujuan Dukungan:</strong></p><ul><li>Membantu korban memproses trauma</li><li>Membangun kembali kepercayaan diri</li><li>Memberikan coping strategies</li><li>Mencegah long-term psychological impact</li></ul>',
                'is_published' => true,
                'published_at' => now(),
            ]
        ];

        foreach ($articles as $article) {
            Article::create($article);
        }

        // Create test user
        User::factory()->create([
            'name' => 'Admin PolijeCare',
            'email' => 'admin@polije.ac.id',
        ]);
    }
}
