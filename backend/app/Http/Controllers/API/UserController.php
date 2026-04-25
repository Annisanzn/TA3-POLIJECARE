<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $role = $request->query('role');
        $perPage = (int) $request->query('per_page', 6);
        $perPage = max(1, min($perPage, 100));

        $paginator = User::query()
            ->when($search, function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('nim', 'like', "%{$search}%");
                });
            })
            ->when($role && $role !== 'all', function ($q) use ($role) {
                // Treat admin as operator
                if ($role === 'operator') {
                    $q->whereIn('role', ['operator', 'admin']);
                    return;
                }

                if ($role === 'admin') {
                    $q->whereIn('role', ['operator', 'admin']);
                    return;
                }

                $q->where('role', $role);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $users = $paginator->getCollection()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                // Normalize role: admin is treated as operator
                'role' => $user->role === 'admin' ? 'operator' : $user->role,
                'nim' => $user->nim,
                'created_at' => $user->created_at->toDateTimeString(),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'users' => $users,
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'total_pages' => $paginator->lastPage(),
                ],
            ],
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users', 'regex:/^[^\s@]+@(student\.)?polije\.ac\.id$/i'],
            'password' => 'required|string|min:8',
            'role' => 'required|in:konselor,operator,user,admin',
            'nim' => 'nullable|string|max:20',
        ], [
            'email.regex' => 'Gunakan email resmi Polije (@polije.ac.id atau @student.polije.ac.id)',
        ]);

        if (($validated['role'] ?? null) === 'admin') {
            $validated['role'] = 'operator';
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'nim' => $validated['nim'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id, 'regex:/^[^\s@]+@(student\.)?polije\.ac\.id$/i'],
            'password' => 'sometimes|string|min:8',
            'role' => 'sometimes|in:konselor,operator,user,admin',
            'nim' => 'nullable|string|max:20',
        ], [
            'email.regex' => 'Gunakan email resmi Polije (@polije.ac.id atau @student.polije.ac.id)',
        ]);

        if (($validated['role'] ?? null) === 'admin') {
            $validated['role'] = 'operator';
        }

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Get user statistics.
     */
    public function stats()
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Current totals
        $totalUsers = User::count();
        $konselorCount = User::where('role', 'konselor')->count();
        $operatorCount = User::whereIn('role', ['operator', 'admin'])->count();
        $penggunaCount = User::where('role', 'user')->count();

        // Users added THIS month
        $newThisMonth = User::where('created_at', '>=', $startOfMonth)->count();
        $newKonselorThisMonth = User::where('role', 'konselor')->where('created_at', '>=', $startOfMonth)->count();
        $newOperatorThisMonth = User::whereIn('role', ['operator', 'admin'])->where('created_at', '>=', $startOfMonth)->count();
        $newPenggunaThisMonth = User::where('role', 'user')->where('created_at', '>=', $startOfMonth)->count();

        // Users added LAST month (for comparison)
        $newLastMonth = User::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();

        // Calculate percentage growth
        $growthPercent = $newLastMonth > 0
            ? round((($newThisMonth - $newLastMonth) / $newLastMonth) * 100)
            : ($newThisMonth > 0 ? 100 : 0);

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => $totalUsers,
                'konselor' => $konselorCount,
                'operator' => $operatorCount,
                'pengguna' => $penggunaCount,
                'growth' => [
                    'total_change' => $newThisMonth,
                    'total_percent' => $growthPercent,
                    'konselor_change' => $newKonselorThisMonth,
                    'operator_change' => $newOperatorThisMonth,
                    'pengguna_change' => $newPenggunaThisMonth,
                ],
            ]
        ]);
    }

    /**
     * Get statistics for the authenticated user's profile.
     */
    public function profileStats(Request $request)
    {
        $user = $request->user();
        $stats = [
            'total_contribution' => 0,
            'label' => 'Kontribusi',
        ];

        if ($user->role === 'user') {
            $stats['total_contribution'] = \App\Models\Complaint::where('user_id', $user->id)->count();
            $stats['label'] = 'Laporan Dibuat';
        } elseif ($user->role === 'konselor') {
            $stats['total_contribution'] = \App\Models\CounselingSchedule::where('counselor_id', $user->id)->count();
            $stats['label'] = 'Sesi Ditangani';
        } elseif (in_array($user->role, ['operator', 'admin'])) {
            $stats['total_contribution'] = \App\Models\Complaint::count();
            $stats['label'] = 'Total Kasus Sistem';
        }

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get display name for role.
     */
    private function getRoleDisplayName($role)
    {
        $roleNames = [
            'admin' => 'Admin',
            'konselor' => 'Konselor',
            'operator' => 'Operator',
            'user' => 'Pengguna',
        ];

        return $roleNames[$role] ?? $role;
    }
}