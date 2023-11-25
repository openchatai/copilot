<?php

namespace FiveamCode\LaravelNotionApi\Tests;

use FiveamCode\LaravelNotionApi\NotionFacade;
use Illuminate\Support\Collection;
use Orchestra\Testbench\TestCase as Orchestra;

class NotionApiTest extends Orchestra
{
    /**
     * @param  \Illuminate\Foundation\Application  $app
     * @return string[]
     */
    protected function getPackageProviders($app): array
    {
        return ['FiveamCode\LaravelNotionApi\LaravelNotionApiServiceProvider'];
    }

    /**
     * @param  \Illuminate\Foundation\Application  $app
     * @return string[]
     */
    protected function getPackageAliases($app): array
    {
        return [
            'Notion' => NotionFacade::class,
        ];
    }

    protected function assertContainsInstanceOf(string $class, $haystack): bool
    {
        if (! is_array($haystack) && ! ($haystack instanceof Collection)) {
            throw new \InvalidArgumentException('$haystack must be an array or a Collection');
        }

        foreach ($haystack as $item) {
            if (get_class($item) === $class) {
                return true;
            }
        }

        return false;
    }
}
