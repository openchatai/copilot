<?php

use App\Http\Api\Controllers\MessageController;
use App\Http\Controllers\DemoPetController;
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

/**
 * This endpoint is used to send a message to the chatbot backend and only used by Zapier.
 */
Route::get('chat/init', [MessageController::class, 'initChat']);
Route::post('chat/send', [MessageController::class, 'sendChat']);



/**
 * Pet demo API
 * These APIs are used for the demo copilot. some of them are hardcoded.
 *
 * In real life scenarios these APIs will heavily rely on DB calls to fetch and store data.
 */
Route::get('pets/data/analytics', [DemoPetController::class, 'analytics']);
Route::get('pets/data/search', [DemoPetController::class, 'searchPetInAllFields']);
Route::get('pets', [DemoPetController::class, 'index']);
Route::get('pets/{id}', [DemoPetController::class, 'show']);
Route::post('pets', [DemoPetController::class, 'store']);
Route::put('pets/{id}', [DemoPetController::class, 'update']);
Route::delete('pets/{id}', [DemoPetController::class, 'delete']);
Route::delete('pets/by-name', [DemoPetController::class, 'deletePetByName']);



