<?php namespace Aws\Laravel;

use Aws\AwsClientInterface;
use Illuminate\Support\Facades\Facade;

/**
 * Facade for the AWS service
 *
 * @method static AwsClientInterface createClient($name, array $args = []) Get a client from the service builder.
 */
class AwsFacade extends Facade
{

    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return 'aws';
    }

}
