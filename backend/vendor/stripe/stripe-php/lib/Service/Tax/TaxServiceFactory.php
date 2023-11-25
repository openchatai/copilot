<?php

// File generated from our OpenAPI spec

namespace Stripe\Service\Tax;

/**
 * Service factory class for API resources in the Tax namespace.
 *
 * @property CalculationService $calculations
 * @property TransactionService $transactions
 */
class TaxServiceFactory extends \Stripe\Service\AbstractServiceFactory
{
    /**
     * @var array<string, string>
     */
    private static $classMap = [
        'calculations' => CalculationService::class,
        'transactions' => TransactionService::class,
    ];

    protected function getServiceClass($name)
    {
        return \array_key_exists($name, self::$classMap) ? self::$classMap[$name] : null;
    }
}
