<?php

use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\ChatbotSettingController;
use App\Http\Controllers\MarketingWebsiteController;
use App\Http\Controllers\OnboardingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

/**
 * Demo
 */
Route::get('/demo/{token}', [ChatbotController::class, 'demo'])->name('demo');


