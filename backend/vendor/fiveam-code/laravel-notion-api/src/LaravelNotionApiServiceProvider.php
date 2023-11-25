<?php

namespace FiveamCode\LaravelNotionApi;

use Illuminate\Support\ServiceProvider;

/**
 * Class LaravelNotionApiServiceProvider.
 */
class LaravelNotionApiServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     */
    public function boot()
    {
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../config/config.php' => config_path('laravel-notion-api.php'),
            ], 'config');
        }
    }

    /**
     * Register the application services.
     */
    public function register()
    {
        // Automatically apply the package configuration
        $this->mergeConfigFrom(__DIR__.'/../config/config.php', 'laravel-notion-api');

        $this->app->singleton(Notion::class, function () {
            return new Notion(config('laravel-notion-api.notion-api-token'), config('laravel-notion-api.version'));
        });
    }
}
