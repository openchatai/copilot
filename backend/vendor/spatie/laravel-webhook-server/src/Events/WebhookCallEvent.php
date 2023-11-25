<?php

namespace Spatie\WebhookServer\Events;

use GuzzleHttp\Psr7\Response;
use GuzzleHttp\TransferStats;

abstract class WebhookCallEvent
{
    public function __construct(
        public string $httpVerb,
        public string $webhookUrl,
        public array $payload,
        public array $headers,
        public array $meta,
        public array $tags,
        public int $attempt,
        public ?Response $response,
        public ?string $errorType,
        public ?string $errorMessage,
        public string $uuid,
        public ?TransferStats $transferStats
    ) {
    }
}
