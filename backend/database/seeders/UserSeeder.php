<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test users
        $users = [
            [
                'name' => 'Ahmad Mahasiswa',
                'email' => '2021001@student.polije.ac.id',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'nim' => '2021001',
            ],
            [
                'name' => 'Siti Konselor',
                'email' => 'siti@polije.ac.id',
                'password' => Hash::make('password123'),
                'role' => 'konselor',
                'nim' => null,
            ],
            [
                'name' => 'Budi Operator',
                'email' => 'budi@polije.ac.id',
                'password' => Hash::make('password123'),
                'role' => 'operator',
                'nim' => null,
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
