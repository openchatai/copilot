<?php

namespace FiveamCode\LaravelNotionApi\Query\Filters;

use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;

class Operators
{
    // ToDo: Make this a enum with PHP 8.1
    const EQUALS = 'equals';
    const DOES_NOT_EQUAL = 'does_not_equal';
    const CONTAINS = 'contains';
    const DOES_NOT_CONTAIN = 'does_not_contain';
    const STARTS_WITH = 'starts_with';
    const ENDS_WITH = 'ends_with';
    const IS_EMPTY = 'is_empty';
    const IS_NOT_EMPTY = 'is_not_empty';
    const GREATER_THAN = 'greater_than';
    const LESS_THAN = 'less_than';
    const GREATER_THAN_OR_EQUAL_TO = 'greater_than_or_equal_to';
    const LESS_THAN_OR_EQUAL_TO = 'less_than_or_equal_to';
    const BEFORE = 'before';
    const AFTER = 'after';
    const ON_OR_BEFORE = 'on_or_before';
    const ON_OR_AFTER = 'on_or_after';
    const PAST_WEEK = 'past_week';
    const PAST_MONTH = 'past_month';
    const PAST_YEAR = 'past_year';
    const NEXT_WEEK = 'next_week';
    const NEXT_MONTH = 'next_month';
    const NEXT_YEAR = 'next_year';

    const AND = 'and';
    const OR = 'or';

    // TODO: Formula filter condition

    public static function getValidComparisonOperators($filterType)
    {
        switch ($filterType) {
            case 'text':
                return Operators::text();
            case 'number':
                return Operators::number();
            default:
                throw HandlingException::instance('Invalid filterType.', compact('filterType'));
        }
    }

    private static function text()
    {
        return [
            Operators::EQUALS,
            Operators::DOES_NOT_EQUAL,
            Operators::CONTAINS,
            Operators::DOES_NOT_CONTAIN,
            Operators::STARTS_WITH,
            Operators::ENDS_WITH,
            Operators::IS_EMPTY,
            Operators::IS_NOT_EMPTY,
        ];
    }

    private static function number()
    {
        return [
            Operators::EQUALS,
            Operators::DOES_NOT_EQUAL,
            Operators::GREATER_THAN,
            Operators::LESS_THAN,
            Operators::GREATER_THAN_OR_EQUAL_TO,
            Operators::LESS_THAN_OR_EQUAL_TO,
            Operators::IS_EMPTY,
            Operators::IS_NOT_EMPTY,
        ];
    }
}
