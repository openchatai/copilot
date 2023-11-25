<?php

namespace Spatie\LaravelPackageTools\Commands;

use Closure;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Spatie\LaravelPackageTools\Package;

class InstallCommand extends Command
{
    protected Package $package;

    public ?Closure $startWith = null;

    protected bool $shouldPublishConfigFile = false;

    protected bool $shouldPublishAssets = false;

    protected bool $shouldPublishMigrations = false;

    protected bool $askToRunMigrations = false;

    protected bool $copyServiceProviderInApp = false;

    protected ?string $starRepo = null;

    public ?Closure $endWith = null;

    public $hidden = true;

    public function __construct(Package $package)
    {
        $this->signature = $package->shortName() . ':install';

        $this->description = 'Install ' . $package->name;

        $this->package = $package;

        parent::__construct();
    }

    public function handle()
    {
        if ($this->startWith) {
            ($this->startWith)($this);
        }

        if ($this->shouldPublishConfigFile) {
            $this->comment('Publishing config file...');

            $this->callSilently("vendor:publish", [
                '--tag' => "{$this->package->shortName()}-config",
            ]);
        }
        
        if ($this->shouldPublishAssets) {
            $this->comment('Publishing assets...');

            $this->callSilently("vendor:publish", [
                '--tag' => "{$this->package->shortName()}-assets",
            ]);
        }

        if ($this->shouldPublishMigrations) {
            $this->comment('Publishing migration...');

            $this->callSilently("vendor:publish", [
                '--tag' => "{$this->package->shortName()}-migrations",
            ]);
        }

        if ($this->askToRunMigrations) {
            if ($this->confirm('Would you like to run the migrations now?')) {
                $this->comment('Running migrations...');

                $this->call('migrate');
            }
        }

        if ($this->copyServiceProviderInApp) {
            $this->comment('Publishing service provider...');

            $this->copyServiceProviderInApp();
        }

        if ($this->starRepo) {
            if ($this->confirm('Would you like to star our repo on GitHub?')) {
                $repoUrl = "https://github.com/{$this->starRepo}";

                if (PHP_OS_FAMILY == 'Darwin') {
                    exec("open {$repoUrl}");
                }
                if (PHP_OS_FAMILY == 'Windows') {
                    exec("start {$repoUrl}");
                }
                if (PHP_OS_FAMILY == 'Linux') {
                    exec("xdg-open {$repoUrl}");
                }
            }
        }

        $this->info("{$this->package->shortName()} has been installed!");

        if ($this->endWith) {
            ($this->endWith)($this);
        }
    }

    public function publishConfigFile(): self
    {
        $this->shouldPublishConfigFile = true;

        return $this;
    }
    
    public function publishAssets(): self
    {
        $this->shouldPublishAssets = true;

        return $this;
    }

    public function publishMigrations(): self
    {
        $this->shouldPublishMigrations = true;

        return $this;
    }

    public function askToRunMigrations(): self
    {
        $this->askToRunMigrations = true;

        return $this;
    }

    public function copyAndRegisterServiceProviderInApp(): self
    {
        $this->copyServiceProviderInApp = true;

        return $this;
    }

    public function askToStarRepoOnGitHub($vendorSlashRepoName): self
    {
        $this->starRepo = $vendorSlashRepoName;

        return $this;
    }

    public function startWith($callable): self
    {
        $this->startWith = $callable;

        return $this;
    }

    public function endWith($callable): self
    {
        $this->endWith = $callable;

        return $this;
    }

    protected function copyServiceProviderInApp(): self
    {
        $providerName = $this->package->publishableProviderName;

        if (! $providerName) {
            return $this;
        }

        $this->callSilent('vendor:publish', ['--tag' => $this->package->shortName() . '-provider']);

        $namespace = Str::replaceLast('\\', '', $this->laravel->getNamespace());

        $appConfig = file_get_contents(config_path('app.php'));

        $class = '\\Providers\\' . $providerName . '::class';

        if (Str::contains($appConfig, $namespace . $class)) {
            return $this;
        }

        file_put_contents(config_path('app.php'), str_replace(
            "{$namespace}\\Providers\\BroadcastServiceProvider::class,",
            "{$namespace}\\Providers\\BroadcastServiceProvider::class," . PHP_EOL . "        {$namespace}{$class},",
            $appConfig
        ));

        file_put_contents(app_path('Providers/' . $providerName . '.php'), str_replace(
            "namespace App\Providers;",
            "namespace {$namespace}\Providers;",
            file_get_contents(app_path('Providers/' . $providerName . '.php'))
        ));

        return $this;
    }
}
