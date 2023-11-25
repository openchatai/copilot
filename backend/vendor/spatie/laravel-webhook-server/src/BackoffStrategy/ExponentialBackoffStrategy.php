<?php

namespace Spatie\WebhookServer\BackoffStrategy;

class ExponentialBackoffStrategy implements BackoffStrategy
{
    public function waitInSecondsAfterAttempt(int $attempt): int
    {
        if ($attempt > 4) {
            return 100000;
        }

        return 10 ** $attempt;
    }
}
