<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'exists:users,email'
            ],
            'password' => [
                'required',
                'string',
                'max:255',
            ]
        ]);

        $email = $validated['email'];
        $password = $validated['password'];

        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json('Unauthorized!', 401);
        }

        $token = $user->createToken('myapptoken')->plainTextToken;

        return response()->json([
            'user' => $user,
            'message' => 'Login Successful!',
            'token' => $token
        ], 200);
    }

    public function destroy(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json('Logout Successful!', 200);
    }
}
