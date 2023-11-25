<?php namespace Aws\Laravel;

use Aws\Sdk;
use Illuminate\Foundation\Application as LaravelApplication;
use Illuminate\Support\ServiceProvider;
use Laravel\Lumen\Application as LumenApplication;

/**
 * AWS SDK for PHP service provider for Laravel applications
 */
class AwsServiceProvider extends ServiceProvider
{
    const VERSION = '3.7.0';

    /**
     * Indicates if loading of the provider is deferred.
     *
     * @var bool
     */
    protected $defer = true;

    /**
     * Bootstrap the configuration
     *
     * @return void
     */
    public function boot()
    {
        if ($this->app instanceof LaravelApplication && $this->app->runningInConsole()) {
            $this->publishes(
                [__DIR__.'/../config/aws_publish.php' => config_path('aws.php')],
                'aws-config'
            );
        } elseif ($this->app instanceof LumenApplication) {
            $this->app->configure('aws');
        }
    }

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        $this->mergeConfigFrom(
            __DIR__.'/../config/aws_default.php',
            'aws'
        );

        $this->app->singleton('aws', function ($app) {
            $config = $app->make('config')->get('aws');

            return new Sdk($config);
        });

        $this->app->alias('aws', 'Aws\Sdk');
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return ['aws', 'Aws\Sdk'];
    }

}
