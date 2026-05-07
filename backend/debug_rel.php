<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Complaint;
use App\Models\ViolenceCategory;

$c = Complaint::where('report_id', 'LPR-20260508-0001')->first();
if (!$c) {
    echo "Complaint not found\n";
    exit;
}

echo "Complaint ID: " . $c->id . "\n";
echo "Report ID: " . $c->report_id . "\n";
echo "Violence Category ID: " . $c->violence_category_id . "\n";

$cat = $c->violenceCategory;
if ($cat) {
    echo "Category Name: " . $cat->name . "\n";
    echo "Category PK: " . $cat->unique_id . "\n";
} else {
    echo "Category RELATIONSHIP IS NULL\n";
    
    // Check if it exists manually
    $manual = ViolenceCategory::where('unique_id', $c->violence_category_id)->first();
    if ($manual) {
        echo "MANUAL FIND SUCCESS: " . $manual->name . "\n";
    } else {
        echo "MANUAL FIND FAILED\n";
    }
}
