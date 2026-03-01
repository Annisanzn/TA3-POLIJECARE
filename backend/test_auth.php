<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email', 'dewi@polije.ac.id')->first();
$complaintId = 8;
$complaint = App\Models\Complaint::find($complaintId);

echo "Counselor ID ($user->email): " . $user->id . "\n";
echo "Complaint ID $complaintId found? " . ($complaint ? 'Yes' : 'No') . "\n";
if ($complaint) {
    echo "Complaint counselor_id: " . $complaint->counselor_id . "\n";
}

$schedules = App\Models\CounselingSchedule::where('complaint_id', $complaintId)->get();
echo "Total schedules for complaint $complaintId: " . $schedules->count() . "\n";
foreach ($schedules as $s) {
    echo "  - Schedule ID: {$s->id}, counselor_id: {$s->counselor_id}, status: {$s->status}\n";
}
