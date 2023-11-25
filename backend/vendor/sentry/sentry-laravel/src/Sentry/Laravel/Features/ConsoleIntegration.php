<?php

namespace Sentry\Laravel\Features;

use Illuminate\Console\Scheduling\Event as SchedulingEvent;
use Illuminate\Contracts\Cache\Factory as Cache;
use Illuminate\Contracts\Foundation\Application;
use Sentry\CheckIn;
use Sentry\CheckInStatus;
use Sentry\Event as SentryEvent;
use Sentry\SentrySdk;

class ConsoleIntegration extends Feature
{
    /**
     * @var array<string, CheckIn> The list of checkins that are currently in progress.
     */
    private $checkInStore = [];

    /**
     * @var Cache The cache repository.
     */
    private $cache;

    public function isApplicable(): bool
    {
        return $this->container()->make(Application::class)->runningInConsole();
    }

    public function setup(Cache $cache): void
    {
        $this->cache = $cache;

        $startCheckIn  = function (string $mutex, string $slug, bool $useCache, int $useCacheTtlInMinutes) {
            $this->startCheckIn($mutex, $slug, $useCache, $useCacheTtlInMinutes);
        };
        $finishCheckIn = function (string $mutex, string $slug, CheckInStatus $status, bool $useCache) {
            $this->finishCheckIn($mutex, $slug, $status, $useCache);
        };

        SchedulingEvent::macro('sentryMonitor', function (string $monitorSlug) use ($startCheckIn, $finishCheckIn) {
            /** @var SchedulingEvent $this */
            return $this
                ->before(function () use ($startCheckIn, $monitorSlug) {
                    /** @var SchedulingEvent $this */
                    $startCheckIn($this->mutexName(), $monitorSlug, $this->runInBackground, $this->expiresAt);
                })
                ->onSuccess(function () use ($finishCheckIn, $monitorSlug) {
                    /** @var SchedulingEvent $this */
                    $finishCheckIn($this->mutexName(), $monitorSlug, CheckInStatus::ok(), $this->runInBackground);
                })
                ->onFailure(function () use ($finishCheckIn, $monitorSlug) {
                    /** @var SchedulingEvent $this */
                    $finishCheckIn($this->mutexName(), $monitorSlug, CheckInStatus::error(), $this->runInBackground);
                });
        });
    }

    private function startCheckIn(string $mutex, string $slug, bool $useCache, int $useCacheTtlInMinutes): void
    {
        $checkIn = $this->createCheckIn($slug, CheckInStatus::inProgress());

        $cacheKey = $this->buildCacheKey($mutex, $slug);

        $this->checkInStore[$cacheKey] = $checkIn;

        if ($useCache) {
            $this->cache->store()->put($cacheKey, $checkIn->getId(), $useCacheTtlInMinutes * 60);
        }

        $this->sendCheckIn($checkIn);
    }

    private function finishCheckIn(string $mutex, string $slug, CheckInStatus $status, bool $useCache): void
    {
        $cacheKey = $this->buildCacheKey($mutex, $slug);

        $checkIn = $this->checkInStore[$cacheKey] ?? null;

        if ($checkIn === null && $useCache) {
            $checkInId = $this->cache->store()->get($cacheKey);

            if ($checkInId !== null) {
                $checkIn = $this->createCheckIn($slug, $status, $checkInId);
            }
        }

        // This should never happen (because we should always start before we finish), but better safe than sorry
        if ($checkIn === null) {
            return;
        }

        // We don't need to keep the checkIn ID stored since we finished executing the command
        unset($this->checkInStore[$mutex]);

        if ($useCache) {
            $this->cache->store()->forget($cacheKey);
        }

        $checkIn->setStatus($status);

        $this->sendCheckIn($checkIn);
    }

    private function sendCheckIn(CheckIn $checkIn): void
    {
        $event = SentryEvent::createCheckIn();
        $event->setCheckIn($checkIn);

        SentrySdk::getCurrentHub()->captureEvent($event);
    }

    private function createCheckIn(string $slug, CheckInStatus $status, string $id = null): CheckIn
    {
        $options = SentrySdk::getCurrentHub()->getClient()->getOptions();

        return new CheckIn(
            $slug,
            $status,
            $id,
            $options->getRelease(),
            $options->getEnvironment()
        );
    }

    private function buildCacheKey(string $mutex, string $slug): string
    {
        // We use the mutex name as part of the cache key to avoid collisions between the same commands with the same schedule but with different slugs
        return 'sentry:checkIn:' . sha1("{$mutex}:{$slug}");
    }
}
