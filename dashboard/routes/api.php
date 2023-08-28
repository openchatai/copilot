<?php

use App\Http\Api\Controllers\MessageController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\ChatbotSettingController;
use App\Http\Controllers\DemoPetController;
use App\Http\Controllers\OnboardingController;
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


Route::get('/copilot/{id}', [ChatbotSettingController::class, 'generalSettings']);
Route::delete('/copilot/{id}', [ChatbotSettingController::class, 'deleteBot']);
Route::post('/copilot/{id}', [ChatbotSettingController::class, 'generalSettingsUpdate']);
Route::get('/copilot/{id}/validator', [OnboardingController::class, 'validator']);
Route::get('/copilot/swagger/pre-made', [ChatbotController::class, 'handleSwaggerViaPremadeTemplate']);



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



