<?php

use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use FiveamCode\LaravelNotionApi\Query\Filters\Filter;
use FiveamCode\LaravelNotionApi\Query\Filters\FilterBag;
use FiveamCode\LaravelNotionApi\Query\Filters\Operators;

it('creates a FilterBag with an "or" operator with the instance method', function () {
    $filterBag = FilterBag::or();

    $this->assertInstanceOf(FilterBag::class, $filterBag);

    $queryFilter = $filterBag->toQuery();

    $this->assertArrayHasKey('or', $queryFilter);
});

it('creates a FilterBag with an "and" operator with the instance method', function () {
    $filterBag = FilterBag::and();

    $this->assertInstanceOf(FilterBag::class, $filterBag);

    $queryFilter = $filterBag->toQuery();

    $this->assertArrayHasKey('and', $queryFilter);
});

it('throws an exception when providing an invalid operator', function () {
    $this->expectException(HandlingException::class);
    $this->expectExceptionMessage('Invalid operator for FilterBag: invalid');

    new FilterBag('invalid');
});

it('only allows the nesting of FilterBags up to two levels', function () {
    $this->expectException(HandlingException::class);
    $this->expectExceptionMessage('The maximum nesting level of compound filters must not exceed 2.');

    $filterBag = new FilterBag('and');

    $filterBag->addFilter(
        Filter::rawFilter('Known for', [
            'multi_select' => ['contains' => 'UNIVAC'],
        ])
    );

    $nameFilterBag = new FilterBag('or');
    $nameFilterBag
        ->addFilter(Filter::textFilter('Name', Operators::CONTAINS, 'Grace'))
        ->addFilter(Filter::textFilter('Name', Operators::CONTAINS, 'Jean'));

    $anotherBag = new FilterBag();
    $nameFilterBag->addFilterBag($anotherBag);

    $filterBag->addFilterBag($nameFilterBag);
});

it('creates a filter bag with the AND operator and two conditions', function () {
    $filterBag = new FilterBag(Operators::AND);

    // Filter for all entries that are
    // (Known for == UNIVAC && Known for == ENIAC)

    $filterBag->addFilter(
        Filter::rawFilter('Known for', [
            'multi_select' => ['contains' => 'UNIVAC'],
        ])
    );

    $filterBag->addFilter(
        Filter::rawFilter('Known for', [
            'multi_select' => ['contains' => 'ENIAC'],
        ])
    );

    $filterBagQuery = $filterBag->toQuery();
    $this->assertArrayHasKey(Operators::AND, $filterBagQuery);
    $this->assertCount(2, $filterBagQuery[Operators::AND]);

    // check structure of first filter compound
    $filterQuery = $filterBagQuery[Operators::AND][0];
    $this->assertArrayHasKey('property', $filterQuery);
    $this->assertEquals('Known for', $filterQuery['property']);
    $this->assertArrayHasKey('multi_select', $filterQuery);
    $this->assertArrayHasKey('contains', $filterQuery['multi_select']);
    $this->assertEquals('UNIVAC', $filterQuery['multi_select']['contains']);

    // check structure of second filter compound
    $filterQuery = $filterBagQuery[Operators::AND][1];
    $this->assertArrayHasKey('property', $filterQuery);
    $this->assertEquals('Known for', $filterQuery['property']);
    $this->assertArrayHasKey('multi_select', $filterQuery);
    $this->assertArrayHasKey('contains', $filterQuery['multi_select']);
    $this->assertEquals('ENIAC', $filterQuery['multi_select']['contains']);
});

it('creates a filter bag with the OR operator and three conditions', function () {
    $filterBag = new FilterBag(Operators::OR);

    // Filter for all entries that have
    // (Name == Grace || Name == Jean || Name == Ada)

    $filterBag
        ->addFilter(Filter::textFilter('Name', Operators::CONTAINS, 'Grace'))
        ->addFilter(Filter::textFilter('Name', Operators::CONTAINS, 'Jean'))
        ->addFilter(Filter::textFilter('Name', Operators::CONTAINS, 'Ada'));

    $filterBagQuery = $filterBag->toQuery();

    $this->assertArrayHasKey(Operators::OR, $filterBagQuery);
    $this->assertCount(3, $filterBagQuery[Operators::OR]);

    // check structure of first filter compound
    $filterQuery = $filterBagQuery[Operators::OR][0];
    $this->assertArrayHasKey('property', $filterQuery);
    $this->assertEquals('Name', $filterQuery['property']);
    $this->assertArrayHasKey('text', $filterQuery);
    $this->assertArrayHasKey('contains', $filterQuery['text']);
    $this->assertEquals('Grace', $filterQuery['text']['contains']);

    // check value of second filter compound
    $filterQuery = $filterBagQuery[Operators::OR][1];
    $this->assertEquals('Jean', $filterQuery['text']['contains']);

    // check value of third filter compound
    $filterQuery = $filterBagQuery[Operators::OR][2];
    $this->assertEquals('Ada', $filterQuery['text']['contains']);
});

it('creates a filter bag with with the AND operator and a nested OR condition', function () {
    // Filter for all entries that are
    // (KnownFor == Univac && (Name == Grace || Name == Jean))

    $filterBag = new FilterBag(Operators::AND);

    $filterBag->addFilter(
        Filter::rawFilter('Known for', [
            'multi_select' => ['contains' => 'UNIVAC'],
        ])
    );

    $nameFilterBag = new FilterBag(Operators::OR);
    $nameFilterBag
        ->addFilter(Filter::textFilter('Name', Operators::CONTAINS, 'Grace'))
        ->addFilter(Filter::textFilter('Name', Operators::CONTAINS, 'Jean'));

    $filterBag->addFilterBag($nameFilterBag);

    $this->assertInstanceOf(FilterBag::class, $filterBag);
    $this->assertInstanceOf(FilterBag::class, $nameFilterBag);

    $filterBagQuery = $filterBag->toQuery();

    $this->assertArrayHasKey(Operators::AND, $filterBagQuery);

    // check structure of first AND filter component
    $multiSelectFilterQuery = $filterBagQuery[Operators::AND][0];
    $this->assertArrayHasKey('property', $multiSelectFilterQuery);
    $this->assertEquals('Known for', $multiSelectFilterQuery['property']);
    $this->assertArrayHasKey('multi_select', $multiSelectFilterQuery);
    $this->assertArrayHasKey('contains', $multiSelectFilterQuery['multi_select']);
    $this->assertEquals('UNIVAC', $multiSelectFilterQuery['multi_select']['contains']);

    // check structure of second AND filter component, which is another filter bag
    // with an OR operator
    $nameFilterBagQuery = $filterBagQuery[Operators::AND][1];
    $this->assertArrayHasKey(Operators::OR, $nameFilterBagQuery);
    $this->assertCount(2, $nameFilterBagQuery[Operators::OR]);

    // check structure of the first filter inside the OR filter bag
    $filterQuery = $nameFilterBagQuery[Operators::OR][0];
    $this->assertArrayHasKey('property', $filterQuery);
    $this->assertEquals('Name', $filterQuery['property']);
    $this->assertArrayHasKey('text', $filterQuery);
    $this->assertArrayHasKey('contains', $filterQuery['text']);
    $this->assertEquals('Grace', $filterQuery['text']['contains']);

    // check structure of the second filter inside the OR filter bag
    $filterQuery = $nameFilterBagQuery[Operators::OR][1];
    $this->assertArrayHasKey('property', $filterQuery);
    $this->assertEquals('Name', $filterQuery['property']);
    $this->assertArrayHasKey('text', $filterQuery);
    $this->assertArrayHasKey('contains', $filterQuery['text']);
    $this->assertEquals('Jean', $filterQuery['text']['contains']);
});

it('throws an exception for nesting too many filter bags', function () {
    $this->expectException(HandlingException::class);
    $this->expectExceptionMessage('The maximum nesting level of compound filters must not exceed 2.');

    $filterBag = new FilterBag(Operators::AND);

    $filterBag->addFilter(
        Filter::rawFilter('Known for', [
            'multi_select' => ['contains' => 'UNIVAC'],
        ])
    );

    $nameFilterBag = new FilterBag(Operators::OR);
    $nameFilterBag
        ->addFilter(Filter::textFilter('Name', Operators::CONTAINS, 'Grace'))
        ->addFilter(Filter::textFilter('Name', Operators::CONTAINS, 'Jean'));

    $anotherBag = new FilterBag();
    $nameFilterBag->addFilterBag($anotherBag);

    // that's one nested bag too much
    $filterBag->addFilterBag($nameFilterBag);
});
