<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateOperatorAccount extends Command
{
    protected $signature = 'operator:create
                            {--email= : Email operator}
                            {--name= : Nama operator}
                            {--password= : Password operator}
                            {--update : Update jika email sudah ada}';

    protected $description = 'Buat atau update akun operator';

    public function handle(): int
    {
        $email    = $this->option('email')    ?? $this->ask('Email operator');
        $name     = $this->option('name')     ?? $this->ask('Nama operator');
        $password = $this->option('password') ?? $this->secret('Password (min. 8 karakter)');

        // Validasi
        if (strlen($password) < 8) {
            $this->error('Password minimal 8 karakter!');
            return Command::FAILURE;
        }

        $existing = User::where('email', $email)->first();

        if ($existing) {
            if ($this->option('update') || $this->confirm("Email {$email} sudah ada. Update password?")) {
                $existing->update([
                    'name'     => $name,
                    'password' => Hash::make($password),
                    'role'     => 'operator',
                ]);
                $this->info("✅ Akun operator '{$email}' berhasil diupdate.");
                $this->table(['Field', 'Value'], [
                    ['Email',    $email],
                    ['Nama',     $name],
                    ['Role',     'operator'],
                    ['Password', str_repeat('*', strlen($password))],
                ]);
            } else {
                $this->warn('Operasi dibatalkan.');
                return Command::SUCCESS;
            }
        } else {
            User::create([
                'name'     => $name,
                'email'    => $email,
                'password' => Hash::make($password),
                'role'     => 'operator',
            ]);
            $this->info("✅ Akun operator '{$email}' berhasil dibuat.");
            $this->table(['Field', 'Value'], [
                ['Email',    $email],
                ['Nama',     $name],
                ['Role',     'operator'],
                ['Password', str_repeat('*', strlen($password))],
            ]);
        }

        return Command::SUCCESS;
    }
}
