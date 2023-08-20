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
 * Marketing Website
 */
Route::get('/', [MarketingWebsiteController::class, 'index'])->name('marketing');

/**
 * Dashboard
 */
Route::get('/app', [ChatbotController::class, 'index'])->name('index');


/**
 * Chatbot Settings
 */
Route::get('/app/{id}', [ChatbotSettingController::class, 'generalSettings'])->name('chatbot.settings');
Route::get('/app/{id}/delete', [ChatbotSettingController::class, 'deleteBot'])->name('chatbot.settings.delete');
Route::post('/app/{id}', [ChatbotSettingController::class, 'generalSettingsUpdate'])->name('chatbot.settings.update');
Route::get('/app/{id}/try-and-share', [ChatbotSettingController::class, 'themeSettings'])->name('chatbot.settings-theme');


/**
 * Onboarding Frontend
 */
Route::get('/onboarding/welcome', [OnboardingController::class, 'welcome'])->name('onboarding.001-step-welcome');
Route::get('/onboarding/swagger', [OnboardingController::class, 'swagger'])->name('onboarding.002-step-swagger');
Route::get('/onboarding/validator/{id}', [OnboardingController::class, 'validator'])->name('onboarding.003-step-validator');
Route::get('/onboarding/done/{id}', [OnboardingController::class, 'done'])->name('onboarding.004-step-done');
Route::get('/onboarding/swagger/pre-made', [ChatbotController::class, 'handleSwaggerViaPremadeTemplate'])->name('handleSwaggerViaPremadeTemplate');


/**
 * Onboarding Backend
 */
Route::post('/onboarding/swagger', [ChatbotController::class, 'handleSwaggerFile'])->name('onboarding.swagger.create');
Route::get('/onboarding/{id}/done', [OnboardingController::class, 'done'])->name('onboarding.done');

/**
 * Demo
 */
Route::get('/demo/{token}', [ChatbotController::class, 'demo'])->name('demo');


