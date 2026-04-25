<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'siti@polije.ac.id')->first();
echo "Siti ID: " . $user->id . "\n";
$schedules = \App\Models\CounselorSchedule::where('counselor_id', $user->id)->get();
echo "Count DB: " . $schedules->count() . "\n";
foreach($schedules as $s) {
    echo $s->id . " - " . $s->hari . " - " . $s->jam_mulai . " - is_active: " . $s->is_active . "\n";
}
