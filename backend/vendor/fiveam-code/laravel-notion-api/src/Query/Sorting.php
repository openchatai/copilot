<?php

namespace FiveamCode\LaravelNotionApi\Query;

use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use Illuminate\Support\Collection;

/**
 * Class Sorting.
 */
class Sorting extends QueryHelper
{
    /**
     * @var string|null
     */
    private ?string $timestamp = null;

    /**
     * @var string
     */
    private string $direction;

    /**
     * Sorting constructor.
     *
     * @param  string  $direction
     * @param  string|null  $property
     * @param  string|null  $timestamp
     *
     * @throws HandlingException
     */
    public function __construct(string $direction, string $property = null, string $timestamp = null)
    {
        parent::__construct();

        if ($timestamp !== null && ! $this->validTimestamps->contains($timestamp)) {
            throw HandlingException::instance(
                'Invalid sorting timestamp provided.', ['invalidTimestamp' => $timestamp]
            );
        }

        if (! $this->validDirections->contains($direction)) {
            throw HandlingException::instance(
                'Invalid sorting direction provided.', ['invalidDirection' => $direction]
            );
        }

        $this->property = $property;
        $this->timestamp = $timestamp;
        $this->direction = $direction;
    }

    /**
     * @param  string  $timestampToSort
     * @param  string  $direction
     * @return Sorting
     *
     * @throws HandlingException
     */
    public static function timestampSort(string $timestampToSort, string $direction): Sorting
    {
        return new Sorting($direction, null, $timestampToSort);
    }

    /**
     * @param  string  $property
     * @param  string  $direction
     * @return Sorting
     *
     * @throws HandlingException
     */
    public static function propertySort(string $property, string $direction): Sorting
    {
        return new Sorting($direction, $property);
    }

    /**
     * @return array
     */
    public function toArray(): array
    {
        if ($this->timestamp !== null) {
            return [
                'timestamp' => $this->timestamp,
                'direction' => $this->direction,
            ];
        }

        return [
            'property' => $this->property,
            'direction' => $this->direction,
        ];
    }

    /**
     * @param  Sorting|Collection  $sortings
     * @return array
     */
    public static function sortQuery(Sorting|Collection $sortings): array
    {
        $querySortings = new Collection();

        if ($sortings instanceof Collection) {
            $sortings->each(function (Sorting $sorting) use ($querySortings) {
                $querySortings->push($sorting->toArray());
            });
        } else {
            $querySortings->push($sortings->toArray());
        }

        return $querySortings->toArray();
    }
}
