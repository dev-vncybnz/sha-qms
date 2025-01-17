<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CashierQueueController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VideoController;
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

/* Route::middleware('api-key')->group(function () {
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
}); */

Route::middleware(['api-key'])->group(function () {
    Route::get('/latest-tickets', [CashierQueueController::class, 'latestInProgressTicketCodes']);

    Route::post('/generate-ticket', [QueueController::class, 'store']);
    Route::post('/login', [AuthController::class, 'index']);
    Route::delete('/logout', [AuthController::class, 'destroy'])->middleware('auth:sanctum');
    Route::post('/users', [UserController::class, 'store'])
        ->middleware(['auth:sanctum', 'check-user-role:admin']);

    Route::prefix('/cashier')->group(function () {
        Route::get('/queues', [CashierQueueController::class, 'index']);
        Route::post('/queues', [CashierQueueController::class, 'store']);
        Route::put('/queues/{queue}/skip', [CashierQueueController::class, 'skipQueue']);
        Route::put('/queues', [CashierQueueController::class, 'update']);
    });

    Route::get('/videos', [VideoController::class, 'index']);
    Route::post('/videos', [VideoController::class, 'store'])->middleware('auth:sanctum');
});
