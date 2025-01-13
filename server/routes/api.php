<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('api-key')->group(function () {
    Route::post('/login', [AuthController::class, 'index']);
    Route::get('/queues', [QueueController::class, 'index']);
    Route::post('/queues', [QueueController::class, 'store']);
    Route::get('/latest-queue-codes', [QueueController::class, 'getLatestQueueCodes']);
});

Route::middleware(['api-key', 'auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/queues', [QueueController::class, 'index']);
    Route::put('/queues/{queue}', [QueueController::class, 'update']);
});