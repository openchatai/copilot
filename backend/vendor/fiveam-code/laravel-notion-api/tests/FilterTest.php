<?php

use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use FiveamCode\LaravelNotionApi\Query\Filters\Filter;
use FiveamCode\LaravelNotionApi\Query\Filters\Operators;
use Illuminate\Support\Collection;

it('creates a text filter with the given data', function () {
    $filter = Filter::textFilter('Name', Operators::EQUALS, 'Ada Lovelace');

    $this->assertInstanceOf(Filter::class, $filter);
    $this->assertArrayHasKey('property', $filter->toQuery());
    $this->assertEquals('Name', $filter->toQuery()['property']);
    $this->assertArrayHasKey('text', $filter->toQuery());
    $this->assertArrayHasKey('equals', $filter->toQuery()['text']);
    $this->assertEquals('Ada Lovelace', $filter->toQuery()['text']['equals']); //
});

it('creates a number filter with the given data', function () {
    $filter = Filter::numberFilter('Awesomeness Level', Operators::GREATER_THAN_OR_EQUAL_TO, 9000);

    $this->assertInstanceOf(Filter::class, $filter);
    $this->assertArrayHasKey('property', $filter->toQuery());
    $this->assertEquals('Awesomeness Level', $filter->toQuery()['property']);
    $this->assertArrayHasKey('number', $filter->toQuery());
    $this->assertArrayHasKey('greater_than_or_equal_to', $filter->toQuery()['number']);
    $this->assertEquals('9000', $filter->toQuery()['number']['greater_than_or_equal_to']);
});

it('throws an HandlingException for an invalid comparison operator', function () {
    $this->expectException(HandlingException::class);
    $this->expectExceptionMessage('Invalid comparison operator');
    $filter = Filter::numberFilter('Awesomeness Level', 'non_existing_operator', 9000);
});

it('throws an exception for an invalid filter definition', function () {
    $filter = new Filter('Test');

    $this->expectException(HandlingException::class);
    $this->expectExceptionMessage('Invalid filter definition.');
    $filter->toArray();
});

it('converts a collection of filters to a filter bag with an OR operator', function () {
    $filter = Filter::textFilter('Name', Operators::CONTAINS, 'Grace');
    $filterCollection = (new Collection())->add($filter);

    $endpoint = Notion::database('8284f3ff77e24d4a939d19459e4d6bdc');

    $endpoint->filterBy($filterCollection);

    $queryData = $endpoint->getPostData();

    $this->assertArrayHasKey('filter', $queryData);
    $this->assertArrayHasKey('or', $queryData['filter']);
    $this->assertArrayHasKey('property', $queryData['filter']['or'][0]);
    $this->assertEquals('Name', $queryData['filter']['or'][0]['property']);
    $this->assertArrayHasKey('text', $queryData['filter']['or'][0]);
    $this->assertArrayHasKey('contains', $queryData['filter']['or'][0]['text']);
    $this->assertEquals('Grace', $queryData['filter']['or'][0]['text']['contains']);
});
