<?php

namespace FiveamCode\LaravelNotionApi\Entities\Collections;

use FiveamCode\LaravelNotionApi\Entities\Database;
use FiveamCode\LaravelNotionApi\Entities\Entity;
use FiveamCode\LaravelNotionApi\Entities\Page;
use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use FiveamCode\LaravelNotionApi\Exceptions\NotionException;
use FiveamCode\LaravelNotionApi\Query\StartCursor;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

/**
 * Class EntityCollection.
 */
class EntityCollection
{
    /**
     * @var array
     */
    protected array $responseData = [];

    /**
     * @var array
     */
    protected array $rawResults = [];

    /**
     * @var bool
     */
    protected bool $hasMore = false;

    /**
     * @var string
     */
    protected ?string $nextCursor = null;

    /**
     * @var Collection
     */
    protected Collection $collection;

    /**
     * EntityCollection constructor.
     *
     * @param  array|null  $responseData
     *
     * @throws HandlingException
     * @throws NotionException
     */
    public function __construct(array $responseData = null)
    {
        $this->setResponseData($responseData);
    }

    /**
     * @param  array  $responseData
     *
     * @throws HandlingException
     * @throws NotionException
     */
    protected function setResponseData(array $responseData): void
    {
        // TODO
        // Currently, the API returns not-found objects with status code 200 -
        // so we have to check here on the given status code in the paylaod,
        // if the object was not found.
        if (
            array_key_exists('object', $responseData)
            && $responseData['object'] === 'error'
            && Arr::exists($responseData, 'status') && $responseData['status'] === 404
        ) {
            throw NotionException::instance('Not found', compact('responseData'));
        }

        if (! Arr::exists($responseData, 'object')) {
            throw HandlingException::instance('invalid json-array: no object given');
        }
        if (! Arr::exists($responseData, 'results')) {
            throw HandlingException::instance('invalid json-array: no results given');
        }
        if ($responseData['object'] !== 'list') {
            throw HandlingException::instance('invalid json-array: the given object is not a list');
        }

        $this->responseData = $responseData;
        $this->fillFromRaw();
        $this->collectChildren();
    }

    protected function collectChildren(): void
    {
        $this->collection = new Collection();
        foreach ($this->rawResults as $pageChild) {
            if (Arr::exists($pageChild, 'object')) {
                if ($pageChild['object'] == 'page') {
                    $this->collection->add(new Page($pageChild));
                }
                if ($pageChild['object'] == 'database') {
                    $this->collection->add(new Database($pageChild));
                }
            }
        }
    }

    protected function fillFromRaw()
    {
        $this->fillResult();
        $this->fillCursorInformation();
    }

    protected function fillResult()
    {
        $this->rawResults = $this->responseData['results'];
    }

    protected function fillCursorInformation()
    {
        if (Arr::exists($this->responseData, 'has_more')) {
            $this->hasMore = $this->responseData['has_more'];
        }
        if (Arr::exists($this->responseData, 'next_cursor')) {
            $this->nextCursor = $this->responseData['next_cursor'];
        }
    }

    /**
     * @return array
     */
    public function getRawResponse(): array
    {
        return $this->responseData;
    }

    /**
     * @return string
     */
    public function getRawNextCursor(): ?string
    {
        return $this->nextCursor;
    }

    /**
     * @return Collection
     */
    public function asCollection(): Collection
    {
        return $this->collection;
    }

    /**
     * @return string
     */
    public function asJson(): string
    {
        return $this->asCollection()->map(function (Entity $item) {
            return $item->toArray();
        });
    }

    /**
     * @return bool
     */
    public function hasMoreEntries(): bool
    {
        return $this->hasMore;
    }

    /**
     * @return StartCursor
     */
    public function nextCursor(): ?StartCursor
    {
        $rawNextCursor = $this->getRawNextCursor();
        if ($rawNextCursor === null) {
            return null;
        }

        return new StartCursor($rawNextCursor);
    }
}
