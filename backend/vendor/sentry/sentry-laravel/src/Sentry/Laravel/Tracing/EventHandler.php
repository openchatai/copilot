<?php

namespace Sentry\Laravel\Tracing;

use Exception;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Database\Events as DatabaseEvents;
use Illuminate\Http\Client\Events as HttpClientEvents;
use Illuminate\Queue\Events as QueueEvents;
use Illuminate\Queue\Queue;
use Illuminate\Queue\QueueManager;
use Illuminate\Routing\Events as RoutingEvents;
use RuntimeException;
use Sentry\Laravel\Integration;
use Sentry\Laravel\Util\WorksWithUris;
use Sentry\SentrySdk;
use Sentry\Tracing\Span;
use Sentry\Tracing\SpanContext;
use Sentry\Tracing\SpanStatus;
use Sentry\Tracing\TransactionContext;
use Sentry\Tracing\TransactionSource;

class EventHandler
{
    use WorksWithUris;

    public const QUEUE_PAYLOAD_BAGGAGE_DATA = 'sentry_baggage_data';
    public const QUEUE_PAYLOAD_TRACE_PARENT_DATA = 'sentry_trace_parent_data';

    /**
     * Map event handlers to events.
     *
     * @var array
     */
    protected static $eventHandlerMap = [
        RoutingEvents\RouteMatched::class => 'routeMatched',
        DatabaseEvents\QueryExecuted::class => 'queryExecuted',
        HttpClientEvents\RequestSending::class => 'httpClientRequestSending',
        HttpClientEvents\ResponseReceived::class => 'httpClientResponseReceived',
        HttpClientEvents\ConnectionFailed::class => 'httpClientConnectionFailed',
        DatabaseEvents\TransactionBeginning::class => 'transactionBeginning',
        DatabaseEvents\TransactionCommitted::class => 'transactionCommitted',
        DatabaseEvents\TransactionRolledBack::class => 'transactionRolledBack',
    ];

    /**
     * Map queue event handlers to events.
     *
     * @var array
     */
    protected static $queueEventHandlerMap = [
        QueueEvents\JobProcessing::class => 'queueJobProcessing',
        QueueEvents\JobProcessed::class => 'queueJobProcessed',
        QueueEvents\JobExceptionOccurred::class => 'queueJobExceptionOccurred',
    ];

    /**
     * Indicates if we should we add SQL queries as spans.
     *
     * @var bool
     */
    private $traceSqlQueries;

    /**
     * Indicates if we should we add SQL query origin data to query spans.
     *
     * @var bool
     */
    private $traceSqlQueryOrigins;

    /**
     * Indicates if we should trace queue job spans.
     *
     * @var bool
     */
    private $traceQueueJobs;

    /**
     * Indicates if we should trace queue jobs as separate transactions.
     *
     * @var bool
     */
    private $traceQueueJobsAsTransactions;

    /**
     * Indicates if we should trace HTTP client requests.
     *
     * @var bool
     */
    private $traceHttpClientRequests;

    /**
     * Hold the stack of parent spans that need to be put back on the scope.
     *
     * @var array<int, \Sentry\Tracing\Span|null>
     */
    private $parentSpanStack = [];

    /**
     * Hold the stack of current spans that need to be finished still.
     *
     * @var array<int, \Sentry\Tracing\Span|null>
     */
    private $currentSpanStack = [];

    /**
     * The backtrace helper.
     *
     * @var \Sentry\Laravel\Tracing\BacktraceHelper
     */
    private $backtraceHelper;

    /**
     * EventHandler constructor.
     */
    public function __construct(array $config, BacktraceHelper $backtraceHelper)
    {
        $this->traceSqlQueries = ($config['sql_queries'] ?? true) === true;
        $this->traceSqlQueryOrigins = ($config['sql_origin'] ?? true) === true;

        $this->traceHttpClientRequests = ($config['http_client_requests'] ?? true) === true;

        $this->traceQueueJobs = ($config['queue_jobs'] ?? false) === true;
        $this->traceQueueJobsAsTransactions = ($config['queue_job_transactions'] ?? false) === true;

        $this->backtraceHelper = $backtraceHelper;
    }

    /**
     * Attach all event handlers.
     *
     * @uses self::routeMatchedHandler()
     * @uses self::queryExecutedHandler()
     * @uses self::transactionBeginningHandler()
     * @uses self::transactionCommittedHandler()
     * @uses self::transactionRolledBackHandler()
     * @uses self::httpClientRequestSendingHandler()
     * @uses self::httpClientResponseReceivedHandler()
     * @uses self::httpClientConnectionFailedHandler()
     */
    public function subscribe(Dispatcher $dispatcher): void
    {
        foreach (static::$eventHandlerMap as $eventName => $handler) {
            $dispatcher->listen($eventName, [$this, $handler]);
        }
    }

    /**
     * Attach all queue event handlers.
     *
     * @uses self::queueJobProcessingHandler()
     * @uses self::queueJobProcessedHandler()
     * @uses self::queueJobExceptionOccurredHandler()
     */
    public function subscribeQueueEvents(Dispatcher $dispatcher, QueueManager $queue): void
    {
        // If both types of queue job tracing is disabled also do not register the events
        if (!$this->traceQueueJobs && !$this->traceQueueJobsAsTransactions) {
            return;
        }

        Queue::createPayloadUsing(static function (?string $connection, ?string $queue, ?array $payload): ?array {
            $currentSpan = SentrySdk::getCurrentHub()->getSpan();

            if ($currentSpan !== null && $payload !== null) {
                $payload[self::QUEUE_PAYLOAD_TRACE_PARENT_DATA] = $currentSpan->toTraceparent();
                $payload[self::QUEUE_PAYLOAD_BAGGAGE_DATA] = $currentSpan->toBaggage();
            }

            return $payload;
        });

        foreach (static::$queueEventHandlerMap as $eventName => $handler) {
            $dispatcher->listen($eventName, [$this, $handler]);
        }
    }

    /**
     * Pass through the event and capture any errors.
     *
     * @param string $method
     * @param array  $arguments
     */
    public function __call(string $method, array $arguments)
    {
        $handlerMethod = "{$method}Handler";

        if (!method_exists($this, $handlerMethod)) {
            throw new RuntimeException("Missing tracing event handler: {$handlerMethod}");
        }

        try {
            call_user_func_array([$this, $handlerMethod], $arguments);
        } catch (Exception $e) {
            // Ignore to prevent bubbling up errors in the SDK
        }
    }

    protected function routeMatchedHandler(RoutingEvents\RouteMatched $match): void
    {
        $transaction = SentrySdk::getCurrentHub()->getTransaction();

        if ($transaction === null) {
            return;
        }

        [$transactionName, $transactionSource] = Integration::extractNameAndSourceForRoute($match->route);

        $transaction->setName($transactionName);
        $transaction->getMetadata()->setSource($transactionSource);
    }

    protected function queryExecutedHandler(DatabaseEvents\QueryExecuted $query): void
    {
        if (!$this->traceSqlQueries) {
            return;
        }

        $parentSpan = SentrySdk::getCurrentHub()->getSpan();

        // If there is no tracing span active there is no need to handle the event
        if ($parentSpan === null) {
            return;
        }

        $context = new SpanContext();
        $context->setOp('db.sql.query');
        $context->setDescription($query->sql);
        $context->setStartTimestamp(microtime(true) - $query->time / 1000);
        $context->setEndTimestamp($context->getStartTimestamp() + $query->time / 1000);

        if ($this->traceSqlQueryOrigins) {
            $queryOrigin = $this->resolveQueryOriginFromBacktrace();

            if ($queryOrigin !== null) {
                $context->setData(['db.sql.origin' => $queryOrigin]);
            }
        }

        $parentSpan->startChild($context);
    }

    /**
     * Try to find the origin of the SQL query that was just executed.
     *
     * @return string|null
     */
    private function resolveQueryOriginFromBacktrace(): ?string
    {
        $firstAppFrame = $this->backtraceHelper->findFirstInAppFrameForBacktrace(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS));

        if ($firstAppFrame === null) {
            return null;
        }

        $filePath = $this->backtraceHelper->getOriginalViewPathForFrameOfCompiledViewPath($firstAppFrame) ?? $firstAppFrame->getFile();

        return "{$filePath}:{$firstAppFrame->getLine()}";
    }

    protected function transactionBeginningHandler(DatabaseEvents\TransactionBeginning $event): void
    {
        $parentSpan = SentrySdk::getCurrentHub()->getSpan();

        // If there is no tracing span active there is no need to handle the event
        if ($parentSpan === null) {
            return;
        }

        $context = new SpanContext;
        $context->setOp('db.transaction');

        $this->pushSpan($parentSpan->startChild($context));
    }

    protected function transactionCommittedHandler(DatabaseEvents\TransactionCommitted $event): void
    {
        $span = $this->popSpan();

        if ($span !== null) {
            $span->finish();
            $span->setStatus(SpanStatus::ok());
        }
    }

    protected function transactionRolledBackHandler(DatabaseEvents\TransactionRolledBack $event): void
    {
        $span = $this->popSpan();

        if ($span !== null) {
            $span->finish();
            $span->setStatus(SpanStatus::internalError());
        }
    }

    protected function httpClientRequestSendingHandler(HttpClientEvents\RequestSending $event): void
    {
        if (!$this->traceHttpClientRequests) {
            return;
        }

        $parentSpan = SentrySdk::getCurrentHub()->getSpan();

        // If there is no tracing span active there is no need to handle the event
        if ($parentSpan === null) {
            return;
        }

        $context = new SpanContext;

        $fullUri = $this->getFullUri($event->request->url());
        $partialUri = $this->getPartialUri($fullUri);

        $context->setOp('http.client');
        $context->setDescription($event->request->method() . ' ' . $partialUri);
        $context->setData([
            'url' => $partialUri,
            'method' => $event->request->method(),
            'http.query' => $fullUri->getQuery(),
            'http.fragment' => $fullUri->getFragment(),
        ]);

        $this->pushSpan($parentSpan->startChild($context));
    }

    protected function httpClientResponseReceivedHandler(HttpClientEvents\ResponseReceived $event): void
    {
        if (!$this->traceHttpClientRequests) {
            return;
        }

        $span = $this->popSpan();

        if ($span !== null) {
            $span->finish();
            $span->setHttpStatus($event->response->status());
        }
    }

    protected function httpClientConnectionFailedHandler(HttpClientEvents\ConnectionFailed $event): void
    {
        if (!$this->traceHttpClientRequests) {
            return;
        }

        $span = $this->popSpan();

        if ($span !== null) {
            $span->finish();
            $span->setStatus(SpanStatus::internalError());
        }
    }

    protected function queueJobProcessingHandler(QueueEvents\JobProcessing $event): void
    {
        $parentSpan = SentrySdk::getCurrentHub()->getSpan();

        // If there is no tracing span active and we don't trace jobs as transactions there is no need to handle the event
        if ($parentSpan === null && !$this->traceQueueJobsAsTransactions) {
            return;
        }

        // If there is a parent span we can record that job as a child unless configured to not do so
        if ($parentSpan !== null && !$this->traceQueueJobs) {
            return;
        }

        if ($parentSpan === null) {
            $baggage = $event->job->payload()[self::QUEUE_PAYLOAD_BAGGAGE_DATA] ?? null;
            $traceParent = $event->job->payload()[self::QUEUE_PAYLOAD_TRACE_PARENT_DATA] ?? null;

            $context = TransactionContext::fromHeaders($traceParent ?? '', $baggage ?? '');

            // If the parent transaction was not sampled we also stop the queue job from being recorded
            if ($context->getParentSampled() === false) {
                return;
            }
        } else {
            $context = new SpanContext;
        }

        $resolvedJobName = $event->job->resolveName();

        $job = [
            'job' => $event->job->getName(),
            'queue' => $event->job->getQueue(),
            'resolved' => $resolvedJobName,
            'attempts' => $event->job->attempts(),
            'connection' => $event->connectionName,
        ];

        if ($context instanceof TransactionContext) {
            $context->setName($resolvedJobName);
            $context->setSource(TransactionSource::task());
        }

        $context->setOp('queue.process');
        $context->setData($job);
        $context->setStartTimestamp(microtime(true));

        // When the parent span is null we start a new transaction otherwise we start a child of the current span
        if ($parentSpan === null) {
            $span = SentrySdk::getCurrentHub()->startTransaction($context);
        } else {
            $span = $parentSpan->startChild($context);
        }

        $this->pushSpan($span);
    }

    protected function queueJobExceptionOccurredHandler(QueueEvents\JobExceptionOccurred $event): void
    {
        $this->afterQueuedJob(SpanStatus::internalError());
    }

    protected function queueJobProcessedHandler(QueueEvents\JobProcessed $event): void
    {
        $this->afterQueuedJob(SpanStatus::ok());
    }

    private function afterQueuedJob(?SpanStatus $status = null): void
    {
        $span = $this->popSpan();

        if ($span !== null) {
            $span->finish();
            $span->setStatus($status);
        }
    }

    private function pushSpan(Span $span): void
    {
        $hub = SentrySdk::getCurrentHub();

        $this->parentSpanStack[] = $hub->getSpan();

        $hub->setSpan($span);

        $this->currentSpanStack[] = $span;
    }

    private function popSpan(): ?Span
    {
        if (count($this->currentSpanStack) === 0) {
            return null;
        }

        $parent = array_pop($this->parentSpanStack);

        SentrySdk::getCurrentHub()->setSpan($parent);

        return array_pop($this->currentSpanStack);
    }
}
