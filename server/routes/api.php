<?php

use App\Http\Controllers\AuthController;
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

Route::middleware(['api-key'])->group(function () {
    Route::post('/generate-ticket', [QueueController::class, 'createQueueTicket']);
    Route::get('/latest-tickets', [QueueController::class, 'latestInProgressTicketCodes']);
    Route::get('/videos', [VideoController::class, 'index']);

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/admin/ticket-summary', [QueueController::class, 'getTicketSummary']);
        Route::get('/admin/generate-report', [QueueController::class, 'generateReport']);
        Route::get('/admin/queues', [QueueController::class, 'index']);
        Route::put('/admin/queues/{queue}/skip', [QueueController::class, 'skipQueue']);
        Route::put('/admin/queues', [QueueController::class, 'update']);
        Route::post('/videos', [VideoController::class, 'store']);
        Route::delete('/logout', [AuthController::class, 'destroy']);
        Route::post('/users', [UserController::class, 'store'])
            ->middleware(['check-user-role:admin']);
    });

    Route::post('/login', [AuthController::class, 'index']);
});
