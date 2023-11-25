<?php

use FiveamCode\LaravelNotionApi\Query\Sorting;
use Illuminate\Support\Collection;

it('can sort by a single property', function () {
    $expectedSortQuery = '[{"property":"Birth year","direction":"ascending"}]';

    $sortBy = Sorting::propertySort('Birth year', 'ascending');
    $this->assertEquals($expectedSortQuery, json_encode(Sorting::sortQuery($sortBy)));
});

it('can sort by multiple properties', function () {
    $expectedSortQuery = '[{"timestamp":"created_time","direction":"ascending"},{"property":"Birth year","direction":"ascending"}]';

    $sortings = new Collection();

    $sortings->add(Sorting::timestampSort('created_time', 'ascending'));
    $sortings->add(Sorting::propertySort('Birth year', 'ascending'));

    $this->assertEquals($expectedSortQuery, json_encode(Sorting::sortQuery($sortings)));
});

it('refuses other classes than sorting or collection in the sortBy() method', function () {
    $this->expectException(TypeError::class);

    Notion::database('8284f3ff77e24d4a939d19459e4d6bdc')
        ->sortBy(new stdClass())
        ->query();
});
