<?php

namespace FiveamCode\LaravelNotionApi\Query\Filters;

use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use FiveamCode\LaravelNotionApi\Query\QueryHelper;
use Illuminate\Support\Collection;
use Throwable;

/**
 * Class FilterBag.
 */
class FilterBag extends QueryHelper
{
    /**
     * @var string|mixed
     */
    protected string $operator = 'and'; // TODO shortcut instances + type checking + pretty operators

    /**
     * @var Collection
     */
    protected Collection $content;

    /**
     * @var FilterBag|null
     */
    public ?FilterBag $parentFilterBag = null;

    /**
     * Creates a FilterBag instance with an "or" operator.
     *
     * @return FilterBag
     */
    public static function or(): FilterBag
    {
        return new FilterBag('or');
    }

    /**
     * Creates a FilterBag instance with an "and" operator.
     *
     * @return FilterBag
     */
    public static function and(): FilterBag
    {
        return new FilterBag('and');
    }

    /**
     * @param  string  $operator
     */
    public function __construct(string $operator = 'and')
    {
        $this->isValidOperator($operator);

        $this->content = new Collection;
        $this->operator = $operator;
    }

    /**
     * @param  Filter  $filter
     * @return $this
     */
    public function addFilter(Filter $filter): self
    {
        $this->content->add($filter);

        return $this;
    }

    public function addFilters(Collection $filters): self
    {
        foreach ($filters as $filter) {
            if (! $filter instanceof Filter) {
                throw new HandlingException('The filter bag must only contain filter objects.');
            }
            $this->addFilter($filter);
        }

        return $this;
    }

    /**
     * @throws HandlingException|Throwable
     */
    public function addFilterBag(FilterBag $filterBag): self
    {
        // A filter bag can only be added to another filter bag if it does not have a parent yet and does not
        // contain any other filter bags.
        throw_if($this->parentFilterBag !== null, new HandlingException('The maximum nesting level of compound filters must not exceed 2.'));

        $filterBag->content->each(function ($bag) {
            throw_if($bag instanceof FilterBag, new HandlingException('The maximum nesting level of compound filters must not exceed 2.'));
        });

        $filterBag->parentFilterBag = $this;
        $this->content->add($filterBag);

        return $this;
    }

    /**
     * @return array
     */
    public function toQuery()
    {
        $filters = $this->content->map(function ($set) {
            return $set->toQuery();
        })->toArray();

        return [
            $this->operator => $filters,
        ];
    }

    private function isValidOperator($operator)
    {
        $validOperators = ['and', 'or'];

        throw_if(
            ! in_array($operator, $validOperators),
            new HandlingException('Invalid operator for FilterBag: '.$operator)
        );
    }
}
