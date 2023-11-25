<?php

namespace FiveamCode\LaravelNotionApi\Endpoints;

use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use FiveamCode\LaravelNotionApi\Exceptions\NotionException;
use FiveamCode\LaravelNotionApi\Notion;
use FiveamCode\LaravelNotionApi\Query\StartCursor;
use Illuminate\Http\Client\Response;

/**
 * Class Endpoint.
 */
class Endpoint
{
    public const BASE_URL = 'https://api.notion.com/';
    public const DATABASES = 'databases';
    public const BLOCKS = 'blocks';
    public const PAGES = 'pages';
    public const USERS = 'users';
    public const SEARCH = 'search';
    public const COMMENTS = 'comments';

    /**
     * @var Notion
     */
    public Notion $notion;

    /**
     * @var StartCursor|null
     */
    protected ?StartCursor $startCursor = null;

    /**
     * @var int
     */
    protected int $pageSize = 100;

    /**
     * @var Response|null
     */
    protected ?Response $response = null;

    /**
     * Endpoint constructor.
     *
     * @param  Notion  $notion
     *
     * @throws HandlingException
     */
    public function __construct(Notion $notion)
    {
        $this->notion = $notion;

        if ($this->notion->getConnection() === null) {
            throw HandlingException::instance('Connection could not be established, please check your token.');
        }
    }

    /**
     * @param  string  $endpoint
     * @return string
     */
    protected function url(string $endpoint): string
    {
        return Endpoint::BASE_URL."{$this->notion->getVersion()}/{$endpoint}";
    }

    /**
     * @param  string  $url
     * @return array
     *
     * @throws NotionException|HandlingException
     */
    protected function getJson(string $url): array
    {
        if ($this->response === null) {
            $this->get($url);
        }

        return $this->response->json();
    }

    /**
     * @param  string  $url
     * @return Response
     *
     * @throws NotionException
     * @throws HandlingException
     */
    protected function get(string $url): Response
    {
        $response = $this->notion->getConnection()->get($url);

        if ($response->failed()) {
            throw NotionException::fromResponse($response);
        }

        $this->response = $response;

        return $response;
    }

    /**
     * @param  string  $url
     * @param  array  $body
     * @return Response
     *
     * @throws HandlingException
     * @throws NotionException
     */
    protected function post(string $url, array $body): Response
    {
        $response = $this->notion->getConnection()->post($url, $body);

        if ($response->failed()) {
            throw NotionException::fromResponse($response);
        }

        $this->response = $response;

        return $response;
    }

    /**
     * @param  string  $url
     * @param  array  $body
     * @return Response
     *
     * @throws HandlingException
     * @throws NotionException
     */
    protected function patch(string $url, array $body): Response
    {
        $response = $this->notion->getConnection()->patch($url, $body);

        if ($response->failed()) {
            throw NotionException::fromResponse($response);
        }

        $this->response = $response;

        return $response;
    }

    /**
     * @return string
     */
    protected function buildPaginationQuery(): string
    {
        $paginationQuery = '';

        if ($this->pageSize !== null) {
            $paginationQuery = "page_size={$this->pageSize}&";
        }

        if ($this->startCursor !== null) {
            $paginationQuery .= "start_cursor={$this->startCursor}";
        }

        return $paginationQuery;
    }

    /**
     * @param  int  $limit
     * @return $this
     */
    public function limit(int $limit): Endpoint
    {
        $this->pageSize = min($limit, 100);

        return $this;
    }

    /**
     * @param  StartCursor  $startCursor
     * @return Endpoint
     *
     * @throws HandlingException
     */
    public function offset(StartCursor $startCursor): Endpoint
    {
        $this->startCursor = $startCursor;

        return $this;
    }
}
