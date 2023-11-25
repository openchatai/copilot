<h1 align="center"> Notion for Laravel</h1>

<div align="center">
<img src="https://notionforlaravel.com/images/open-graph.png" alt="Notion For Laravel" width="500">


[![Latest Version on Packagist](https://img.shields.io/packagist/v/fiveam-code/laravel-notion-api.svg?style=flat-square)](https://packagist.org/packages/fiveam-code/laravel-notion-api)
[![Total Downloads](https://img.shields.io/packagist/dt/fiveam-code/laravel-notion-api.svg?style=flat-square)](https://packagist.org/packages/fiveam-code/laravel-notion-api)

[comment]: <> (![GitHub Actions]&#40;https://github.com/fiveam-code/laravel-notion-api/actions/workflows/main.yml/badge.svg&#41;)
</div>
This package provides a simple and crisp way to access the Notion API endpoints, query data and update existing entries.

# Documentation

For a extensive documentation, more context and usage examples, head over to the official documentation at [notionforlaravel.com](https://notionforlaravel.com).


# Quick Start Guide

All examples refer to our test database, which you can
find [here](https://dianawebdev.notion.site/8284f3ff77e24d4a939d19459e4d6bdc?v=bc3a9ce8cdb84d3faefc9ae490136ac2).

## Installation

The package is compatible with Laravel 8, 9 and 10. The minimum PHP requirement is 8.0.

1. Install the package via composer:

   ```bash
   composer require fiveam-code/laravel-notion-api
   ```

2. Get your Notion API access token like explained in [their documentation](https://developers.notion.com/). It's also
   important to grant access to the integration within your Notion pages, which is described in the developer
   documentation at Notion as well.

3. Add a new line to your applications `.env` file:

   ```bash
   NOTION_API_TOKEN="$YOUR_ACCESS_TOKEN"
   ```

4. You're ready to go! You can now access Notion endpoints through the `Notion` facade:

   ```php
   use \Notion;

   Notion::databases()->find("8284f3ff77e24d4a939d19459e4d6bdc");
   ```

   That's it.

For detailed usage information and a list of available endpoints see (the docs).

## Examples


### Fetch a Notion Database

The `databases()->find()` method returns a `FiveamCode\LaravelNotionApi\Entities\Database` object,
which contains all the information about the database, including its properties and the possible values for each
property.

```php
use \Notion;

Notion::databases()
        ->find("8284f3ff77e24d4a939d19459e4d6bdc");
```

### Fetch a Notion Page

The `pages()->find()` method returns a `FiveamCode\LaravelNotionApi\Entities\Page` object,
which contains all the information about the page, including its properties and the possible values for each property.

```php
Notion::pages()
        ->find("e7e5e47d-23ca-463b-9750-eb07ca7115e4");
```

### Search

The `search()` endpoint returns a collection of pages that match the search query. The scope of the search is limited to
the workspace that the integration is installed in
and the pages that are shared with the integration.

```php
Notion::search("Search term")
        ->query()
        ->asCollection();
```

### Query Database

The `database()` endpoint allows you to query a specific database and returns a collection of pages (= database
entries).
You can filter and sort the results and limit the number of returned entries. For detailed information about the
available
filters and sorts, please refer to the [documentation](https://developers.notion.com/reference/post-database-query).

```php
use FiveamCode\LaravelNotionApi\Query\Filters\Filter;
use FiveamCode\LaravelNotionApi\Query\Filters\Operators;

$nameFilter = Filter::textFilter('Name', Operators::EQUALS, 'Ada Lovelace');

\Notion::database("8284f3ff77e24d4a939d19459e4d6bdc")
    ->filterBy($nameFilter)
    ->limit(5)
    ->query()
    ->asCollection();
```

Compound filters for AND or OR queries are also available:

```php
use Illuminate\Support\Collection;
use FiveamCode\LaravelNotionApi\Query\Filters\Filter;
use FiveamCode\LaravelNotionApi\Query\Filters\FilterBag;
use FiveamCode\LaravelNotionApi\Query\Filters\Operators;
use FiveamCode\LaravelNotionApi\Query\Sorting;

# Give me all entries that are
# (KnownFor == UNIVAC || KnownFor == ENIAC)
# and sort them by name ascending

$filterBag = new FilterBag(Operators::AND);

$filterBag->addFilter(
    Filter::rawFilter("Known for", [
        "multi_select" => [Operators::CONTAINS => "UNIVAC"],
    ])
);

$filterBag->addFilter(
    Filter::rawFilter("Known for", [
        "multi_select" => [Operators::CONTAINS => "ENIAC"],
    ])
);

\Notion::database("8284f3ff77e24d4a939d19459e4d6bdc")
    ->filterBy($filterBag)
    ->sortBy(Sorting::propertySort('Name', 'ascending'))
    ->limit(5)
    ->query()
    ->asCollection();
```

### Tests

You can find even more usage examples by checking out the package tests in the `/tests` directory.
We are using [Pest](https://pestphp.com/) for out tests and are currently in the process of switching all existing PHPUnit tests to Pest.

If you want to run the tests in your CLI:

```bash
vendor/bin/pest tests
```

# Support

## Supported by Tinkerwell

<a href="https://tinkerwell.app/">
<img src="https://tinkerwell.app/images/tinkerwell_logo.png" width="64" height="64" alt="Tinkerwell"> <br/>
</a>

The development of this package is supported by [Tinkerwell](https://tinkerwell.app/).


# Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

# Security

If you discover any security related issues, please email hello@dianaweb.dev instead of using the issue tracker.

# Credits

- [Diana Scharf](https://github.com/mechelon)
- [Johannes Güntner](https://github.com/johguentner)

<p align="center">
<img src="https://5amco.de/images/5am.png" width="200" height="200">
</p>

# License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
