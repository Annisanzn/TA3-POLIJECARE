<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->enum('tipe', ['file', 'link']);
            $table->string('file_path')->nullable();
            $table->string('link')->nullable();
            $table->string('kategori');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index('kategori');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
