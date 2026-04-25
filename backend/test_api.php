<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'siti@polije.ac.id')->first();
$request = Illuminate\Http\Request::create('/api/konselor/counselor-schedules', 'GET');
$request->setUserResolver(function() use ($user) { return $user; });
$response = app()->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";
