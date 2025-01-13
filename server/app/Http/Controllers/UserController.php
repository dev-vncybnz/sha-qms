<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\UserStoreRequest;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function store(UserStoreRequest $userStoreRequest)
    {
        $validated = $userStoreRequest->validated();

        $user = User::create($validated);

        return response()->json($user, 201);
    }
}
