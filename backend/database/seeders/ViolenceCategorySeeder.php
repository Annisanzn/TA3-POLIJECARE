<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ViolenceCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Kekerasan Fisik'],
            ['name' => 'Kekerasan Verbal'],
            ['name' => 'Kekerasan Seksual'],
            ['name' => 'Kekerasan Psikologis'],
            ['name' => 'Perundungan'],
            ['name' => 'Cyberbullying'],
            ['name' => 'Bully'],
            ['name' => 'Kekerasan Ekonomi'],
            ['name' => 'Lainnya'],
        ];

        DB::table('violence_categories')->insert($categories);
    }
}
