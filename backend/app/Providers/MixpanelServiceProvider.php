<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Mixpanel;

class MixpanelServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register()
    {
        $this->app->bind('mixpanel', function () {
            return Mixpanel::getInstance(env('MIXPANEL_TOKEN'));
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
