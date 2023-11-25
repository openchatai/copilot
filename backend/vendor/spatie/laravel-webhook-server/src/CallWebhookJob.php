<?php

namespace Spatie\WebhookServer;

use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\TransferStats;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;
use Spatie\WebhookServer\Events\FinalWebhookCallFailedEvent;
use Spatie\WebhookServer\Events\WebhookCallFailedEvent;
use Spatie\WebhookServer\Events\WebhookCallSucceededEvent;

class CallWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public ?string $webhookUrl = null;

    public string $httpVerb;

    public string|array|null $proxy = null;

    public int $tries;

    public int $requestTimeout;

    public string $backoffStrategyClass;

    public ?string $signerClass = null;

    public array $headers = [];

    public bool $verifySsl;

    public bool $throwExceptionOnFailure;

    /** @var string|null */
    public $queue = null;

    public array $payload = [];

    public array $meta = [];

    public array $tags = [];

    public string $uuid = '';

    protected ?Response $response = null;

    protected ?string $errorType = null;

    protected ?string $errorMessage = null;

    protected ?TransferStats $transferStats = null;

    public function handle()
    {
        $lastAttempt = $this->attempts() >= $this->tries;

        try {
            $body = strtoupper($this->httpVerb) === 'GET'
                ? ['query' => $this->payload]
                : ['body' => json_encode($this->payload)];

            $this->response = $this->createRequest($body);

            if (! Str::startsWith($this->response->getStatusCode(), 2)) {
                throw new Exception('Webhook call failed');
            }

            $this->dispatchEvent(WebhookCallSucceededEvent::class);

            return;
        } catch (Exception $exception) {
            if ($exception instanceof RequestException) {
                $this->response = $exception->getResponse();
                $this->errorType = get_class($exception);
                $this->errorMessage = $exception->getMessage();
            }

            if ($exception instanceof ConnectException) {
                $this->errorType = get_class($exception);
                $this->errorMessage = $exception->getMessage();
            }

            if (! $lastAttempt) {
                /** @var \Spatie\WebhookServer\BackoffStrategy\BackoffStrategy $backoffStrategy */
                $backoffStrategy = app($this->backoffStrategyClass);

                $waitInSeconds = $backoffStrategy->waitInSecondsAfterAttempt($this->attempts());

                $this->release($waitInSeconds);
            }

            $this->dispatchEvent(WebhookCallFailedEvent::class);

            if ($lastAttempt || $this->shouldBeRemovedFromQueue()) {
                $this->dispatchEvent(FinalWebhookCallFailedEvent::class);

                $this->throwExceptionOnFailure ? $this->fail($exception) : $this->delete();
            }
        }
    }

    public function tags(): array
    {
        return $this->tags;
    }

    public function getResponse(): ?Response
    {
        return $this->response;
    }

    protected function getClient(): ClientInterface
    {
        return app(Client::class);
    }

    protected function createRequest(array $body): Response
    {
        $client = $this->getClient();

        return $client->request($this->httpVerb, $this->webhookUrl, array_merge([
            'timeout' => $this->requestTimeout,
            'verify' => $this->verifySsl,
            'headers' => $this->headers,
            'on_stats' => function (TransferStats $stats) {
                $this->transferStats = $stats;
            },
        ], $body, is_null($this->proxy) ? [] : ['proxy' => $this->proxy]));
    }

    protected function shouldBeRemovedFromQueue(): bool
    {
        return false;
    }

    private function dispatchEvent(string $eventClass)
    {
        event(new $eventClass(
            $this->httpVerb,
            $this->webhookUrl,
            $this->payload,
            $this->headers,
            $this->meta,
            $this->tags,
            $this->attempts(),
            $this->response,
            $this->errorType,
            $this->errorMessage,
            $this->uuid,
            $this->transferStats
        ));
    }
}
