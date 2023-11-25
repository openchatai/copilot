<?php

namespace Sentry\Laravel\Tracing;

use Closure;
use Illuminate\Http\Request;
use Sentry\SentrySdk;
use Sentry\State\HubInterface;
use Sentry\Tracing\Span;
use Sentry\Tracing\SpanContext;
use Sentry\Tracing\TransactionContext;
use Sentry\Tracing\TransactionSource;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class Middleware
{
    /**
     * The current active transaction.
     *
     * @var \Sentry\Tracing\Transaction|null
     */
    protected $transaction;

    /**
     * The span for the `app.handle` part of the application.
     *
     * @var \Sentry\Tracing\Span|null
     */
    protected $appSpan;

    /**
     * The timestamp of application bootstrap completion.
     *
     * @var float|null
     */
    private $bootedTimestamp;

    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request
     * @param \Closure                 $next
     *
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (app()->bound(HubInterface::class)) {
            $this->startTransaction($request, app(HubInterface::class));
        }

        return $next($request);
    }

    /**
     * Handle the application termination.
     *
     * @param \Illuminate\Http\Request $request
     * @param mixed                    $response
     *
     * @return void
     */
    public function terminate(Request $request, $response): void
    {
        // If there is no transaction or the HubInterface is not bound in the container there is nothing for us to do
        if ($this->transaction === null || !app()->bound(HubInterface::class)) {
            return;
        }

        // We stop here if a route has not been matched unless we are configured to trace missing routes
        if (config('sentry.tracing.missing_routes', false) === false && $request->route() === null) {
            return;
        }

        if ($this->appSpan !== null) {
            $this->appSpan->finish();
        }

        // Make sure we set the transaction and not have a child span in the Sentry SDK
        // If the transaction is not on the scope during finish, the trace.context is wrong
        SentrySdk::getCurrentHub()->setSpan($this->transaction);

        if ($response instanceof SymfonyResponse) {
            $this->hydrateResponseData($response);
        }

        $this->transaction->finish();
    }

    /**
     * Set the timestamp of application bootstrap completion.
     *
     * @param float|null $timestamp The unix timestamp of the booted event, default to `microtime(true)` if not `null`.
     *
     * @return void
     *
     * @internal This method should only be invoked right after the application has finished "booting".
     */
    public function setBootedTimestamp(?float $timestamp = null): void
    {
        $this->bootedTimestamp = $timestamp ?? microtime(true);
    }

    private function startTransaction(Request $request, HubInterface $sentry): void
    {
        $requestStartTime = $request->server('REQUEST_TIME_FLOAT', microtime(true));

        $context = TransactionContext::fromHeaders(
            $request->header('sentry-trace', ''),
            $request->header('baggage', '')
        );

        $requestPath = '/' . ltrim($request->path(), '/');

        $context->setOp('http.server');
        $context->setName($requestPath);
        $context->setSource(TransactionSource::url());
        $context->setStartTimestamp($requestStartTime);

        $context->setData([
            'url' => $requestPath,
            'method' => strtoupper($request->method()),
        ]);

        $transaction = $sentry->startTransaction($context);

        // If this transaction is not sampled, don't set it either and stop doing work from this point on
        if (!$transaction->getSampled()) {
            return;
        }

        $this->transaction = $transaction;

        // Setting the Transaction on the Hub
        SentrySdk::getCurrentHub()->setSpan($this->transaction);

        $bootstrapSpan = $this->addAppBootstrapSpan($request);

        $appContextStart = new SpanContext;
        $appContextStart->setOp('middleware.handle');
        $appContextStart->setStartTimestamp($bootstrapSpan ? $bootstrapSpan->getEndTimestamp() : microtime(true));

        $this->appSpan = $this->transaction->startChild($appContextStart);

        SentrySdk::getCurrentHub()->setSpan($this->appSpan);
    }

    private function addAppBootstrapSpan(Request $request): ?Span
    {
        if ($this->bootedTimestamp === null) {
            return null;
        }

        $laravelStartTime = defined('LARAVEL_START') ? LARAVEL_START : $request->server('REQUEST_TIME_FLOAT');

        if ($laravelStartTime === null) {
            return null;
        }

        $spanContextStart = new SpanContext;
        $spanContextStart->setOp('app.bootstrap');
        $spanContextStart->setStartTimestamp($laravelStartTime);
        $spanContextStart->setEndTimestamp($this->bootedTimestamp);

        $span = $this->transaction->startChild($spanContextStart);

        // Consume the booted timestamp, because we don't want to report the bootstrap span more than once
        $this->bootedTimestamp = null;

        // Add more information about the bootstrap section if possible
        $this->addBootDetailTimeSpans($span);

        return $span;
    }

    private function addBootDetailTimeSpans(Span $bootstrap): void
    {
        // This constant should be defined right after the composer `autoload.php` require statement in `public/index.php`
        // define('SENTRY_AUTOLOAD', microtime(true));
        if (!defined('SENTRY_AUTOLOAD') || !SENTRY_AUTOLOAD) {
            return;
        }

        $autoload = new SpanContext();
        $autoload->setOp('app.php.autoload');
        $autoload->setStartTimestamp($bootstrap->getStartTimestamp());
        $autoload->setEndTimestamp(SENTRY_AUTOLOAD);

        $bootstrap->startChild($autoload);
    }

    private function hydrateResponseData(SymfonyResponse $response): void
    {
        $this->transaction->setHttpStatus($response->getStatusCode());
    }
}
