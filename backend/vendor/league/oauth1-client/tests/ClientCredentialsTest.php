<?php

namespace League\OAuth1\Client\Tests;

use League\OAuth1\Client\Credentials\ClientCredentials;
use Mockery as m;
use PHPUnit\Framework\TestCase;

class ClientCredentialsTest extends TestCase
{
    protected function tearDown(): void
    {
        m::close();

        parent::tearDown();
    }

    public function testManipulating()
    {
        $credentials = new ClientCredentials;
        $this->assertNull($credentials->getIdentifier());
        $credentials->setIdentifier('foo');
        $this->assertEquals('foo', $credentials->getIdentifier());
        $this->assertNull($credentials->getSecret());
        $credentials->setSecret('foo');
        $this->assertEquals('foo', $credentials->getSecret());
    }
}
