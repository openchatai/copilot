<?php

namespace FiveamCode\LaravelNotionApi\Endpoints;

use FiveamCode\LaravelNotionApi\Entities\Collections\EntityCollection;
use FiveamCode\LaravelNotionApi\Entities\Collections\PageCollection;
use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use FiveamCode\LaravelNotionApi\Notion;
use FiveamCode\LaravelNotionApi\Query\Filters\Filter;
use FiveamCode\LaravelNotionApi\Query\Filters\FilterBag;
use FiveamCode\LaravelNotionApi\Query\Filters\Operators;
use FiveamCode\LaravelNotionApi\Query\Sorting;
use Illuminate\Support\Collection;

/**
 * Class Database.
 */
class Database extends Endpoint
{
    /**
     * @var string
     */
    private string $databaseId;

    /**
     * @var Filter|null
     */
    private ?Filter $filter = null; // TODO breaking change as well

    private $filterBag;

    private array $filterData = [];

    /**
     * @var Collection
     */
    private Collection $sorts;

    /**
     * Database constructor.
     *
     * @param  string  $databaseId
     * @param  Notion  $notion
     *
     * @throws \FiveamCode\LaravelNotionApi\Exceptions\HandlingException
     * @throws \FiveamCode\LaravelNotionApi\Exceptions\LaravelNotionAPIException
     */
    public function __construct(string $databaseId, Notion $notion)
    {
        $this->databaseId = $databaseId;

        $this->sorts = new Collection();

        parent::__construct($notion);
    }

    /**
     * @return PageCollection
     *
     * @throws \FiveamCode\LaravelNotionApi\Exceptions\HandlingException
     * @throws \FiveamCode\LaravelNotionApi\Exceptions\NotionException
     */
    public function query(): PageCollection
    {
        $response = $this
            ->post(
                $this->url(Endpoint::DATABASES."/{$this->databaseId}/query"),
                $this->getPostData()
            )
            ->json();

        return new PageCollection($response);
    }

    public function getPostData(): array
    {
        $postData = [];

        if ($this->sorts->isNotEmpty()) {
            $postData['sorts'] = Sorting::sortQuery($this->sorts);
        }

        if ($this->filter !== null && ! is_null($this->filterBag)) {
            throw new HandlingException('Please provide either a filter bag or a single filter.');
        } elseif ($this->filter !== null || ! is_null($this->filterBag)) {
            $postData['filter'] = $this->filterData;
        }

        if ($this->startCursor !== null) {
            $postData['start_cursor'] = $this->startCursor->__toString();
        }

        if ($this->pageSize !== null) {
            $postData['page_size'] = $this->pageSize;
        }

        return $postData;
    }

    /**
     * @param $filter
     * @return Database $this
     *
     * @throws HandlingException
     */
    public function filterBy(Collection|Filter|FilterBag $filter): Database
    {
        if ($filter instanceof Collection) {
            return $this->filterByCollection($filter);
        }
        if ($filter instanceof FilterBag) {
            return $this->filterByBag($filter);
        }
        if ($filter instanceof Filter) {
            return $this->filterBySingleFilter($filter);
        }

        return $this;
    }

    /**
     * @param  Filter  $filter
     * @return $this
     *
     * @throws HandlingException
     */
    public function filterBySingleFilter(Filter $filter): Database
    {
        $this->filter = $filter;
        $this->filterData = ['or' => [$filter->toQuery()]];

        return $this;
    }

    /**
     * @param  FilterBag  $filterBag
     * @return Database $this
     */
    public function filterByBag(FilterBag $filterBag): Database
    {
        $this->filterBag = $filterBag;
        $this->filterData = $filterBag->toQuery();

        return $this;
    }

    /**
     * @param  Collection  $filterCollection
     * @return Database $this
     */
    public function filterByCollection(Collection $filterCollection): Database
    {
        $filterBag = new FilterBag(Operators::OR);
        $filterBag->addFilters($filterCollection);

        return $this->filterByBag($filterBag);
    }

    /**
     * @param  Collection|Sorting  $sorts
     * @return Database $this
     *
     * @throws HandlingException
     */
    public function sortBy(Sorting|Collection $sorts): Database
    {
        $sortInstance = get_class($sorts);
        switch ($sortInstance) {
            case Sorting::class:
                $this->sorts->push($sorts);
                break;
            case Collection::class:
                $this->sorts = $sorts;
                break;
            default:
                throw new HandlingException("The parameter 'sorts' must be either a instance of the class Sorting or a Collection of sortings.");
        }

        return $this;
    }

    /**
     * @param  EntityCollection  $entityCollection
     * @return $this
     */
    public function offsetByResponse(EntityCollection $entityCollection): Database
    {
        $this->offset($entityCollection->nextCursor());

        return $this;
    }
}
