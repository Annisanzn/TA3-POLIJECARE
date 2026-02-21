<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('report_id')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('counselor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('violence_category_id')->constrained('violence_categories');

            $table->enum('victim_type', ['self', 'other']);
            $table->string('victim_name')->nullable();
            $table->string('victim_relationship')->nullable();

            $table->string('location');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->enum('status', ['pending', 'process', 'scheduled', 'completed', 'rejected'])->default('pending');
            $table->dateTime('counseling_schedule')->nullable();
            $table->enum('urgency_level', ['low', 'medium', 'high', 'critical'])->default('low');
            $table->boolean('is_anonymous')->default(false);

            $table->timestamps();

            $table->index(['status', 'urgency_level']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
