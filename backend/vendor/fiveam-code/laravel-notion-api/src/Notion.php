<?php

namespace FiveamCode\LaravelNotionApi;

use FiveamCode\LaravelNotionApi\Endpoints\Block;
use FiveamCode\LaravelNotionApi\Endpoints\Comments;
use FiveamCode\LaravelNotionApi\Endpoints\Database;
use FiveamCode\LaravelNotionApi\Endpoints\Databases;
use FiveamCode\LaravelNotionApi\Endpoints\Endpoint;
use FiveamCode\LaravelNotionApi\Endpoints\Pages;
use FiveamCode\LaravelNotionApi\Endpoints\Search;
use FiveamCode\LaravelNotionApi\Endpoints\Users;
use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

/**
 * Class Notion.
 */
class Notion
{
    /**
     * @var Endpoint
     */
    private Endpoint $endpoint;

    /**
     * @var string
     */
    private string $version;

    /**
     * @var string
     */
    private string $token;

    /**
     * @var PendingRequest|null
     */
    private ?PendingRequest $connection = null;

    /**
     * @var Collection
     */
    private Collection $validVersions;

    /**
     * Notion constructor.
     *
     * @param  string|null  $version
     * @param  string|null  $token
     *
     * @throws HandlingException
     */
    public function __construct(string $token, string $version = 'v1')
    {
        $this->setToken($token);

        $this->validVersions = collect(['v1']);

        $this->setVersion($version);
        $this->connect();
    }

    /**
     * @return Notion
     *
     * @throws HandlingException
     */
    private function connect(): Notion
    {
        $this->connection = Http::withHeaders($this->buildRequestHeader())
            ->withToken($this->token);

        return $this;
    }

    /**
     * Set version of notion-api.
     *
     * @param  string  $version
     * @return Notion
     *
     * @throws HandlingException
     */
    public function setVersion(string $version): Notion
    {
        $this->checkValidVersion($version);
        $this->version = $version;

        return $this;
    }

    /**
     * Wrapper function to set version to v1.
     *
     * @return $this
     *
     * @throws HandlingException
     */
    public function v1(): Notion
    {
        $this->setVersion('v1');

        return $this;
    }

    /**
     * Set notion-api bearer-token.
     *
     * @param  string  $token
     * @return Notion
     */
    private function setToken(string $token): Notion
    {
        $this->token = $token;

        return $this;
    }

    /**
     * @return Databases
     *
     * @throws HandlingException
     */
    public function databases(): Databases
    {
        return new Databases($this);
    }

    /**
     * @param  string  $databaseId
     * @return Database
     *
     * @throws Exceptions\LaravelNotionAPIException
     * @throws HandlingException
     */
    public function database(string $databaseId): Database
    {
        return new Database($databaseId, $this);
    }

    /**
     * @return Pages
     *
     * @throws HandlingException
     */
    public function pages(): Pages
    {
        return new Pages($this);
    }

    /**
     * @param  string  $blockId
     * @return Block
     *
     * @throws Exceptions\LaravelNotionAPIException
     * @throws HandlingException
     */
    public function block(string $blockId): Block
    {
        return new Block($this, $blockId);
    }

    /**
     * @return Users
     *
     * @throws HandlingException
     */
    public function users(): Users
    {
        return new Users($this);
    }

    /**
     * @param  string|null  $searchText
     * @return Search
     *
     * @throws Exceptions\LaravelNotionAPIException
     * @throws HandlingException
     */
    public function search(?string $searchText = ''): Search
    {
        return new Search($this, $searchText);
    }

    /**
     * @return Comments
     *
     * @throws Exceptions\LaravelNotionAPIException
     * @throws HandlingException
     */
    public function comments(): Comments
    {
        return new Comments($this);
    }

    /**
     * @return string
     */
    public function getVersion(): string
    {
        return $this->version;
    }

    /**
     * @return PendingRequest|null
     */
    public function getConnection(): ?PendingRequest
    {
        return $this->connection;
    }

    /**
     * Checks if given version for notion-api is valid.
     *
     * @param  string  $version
     *
     * @throws HandlingException
     */
    public function checkValidVersion(string $version): void
    {
        if (! $this->validVersions->contains($version)) {
            throw HandlingException::instance('Invalid version for Notion-API endpoint', ['invalidVersion' => $version]);
        }
    }

    /**
     * @return string[]
     *
     * @throws HandlingException
     */
    private function buildRequestHeader(): array
    {
        return [
            'Notion-Version' => $this->mapVersionToHeaderVersion(),
        ];
    }

    /**
     * Due to the inconsistency of the Notion API requiring an endpoint url
     * with v* as well as a dated version in the request header, this method
     * maps the given version (e.g. v1) to the version date Notion requires
     * in the header (e.g. "2021-05-13").
     *
     * @return string
     *
     * @throws HandlingException
     */
    private function mapVersionToHeaderVersion(): string
    {
        switch ($this->version) {
            case 'v1':
                return '2021-05-13';
            default:
                throw new HandlingException('Invalid version.');
        }
    }
}
