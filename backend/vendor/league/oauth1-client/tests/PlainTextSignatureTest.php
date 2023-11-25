<?php

namespace League\OAuth1\Client\Tests;

use League\OAuth1\Client\Signature\PlainTextSignature;
use Mockery as m;
use PHPUnit\Framework\TestCase;

class PlainTextSignatureTest extends TestCase
{
    protected function tearDown(): void
    {
        m::close();

        parent::tearDown();
    }

    public function testSigningRequest()
    {
        $signature = new PlainTextSignature($this->getMockClientCredentials());
        $this->assertEquals('clientsecret&', $signature->sign($uri = 'http://www.example.com/'));

        $signature->setCredentials($this->getMockCredentials());
        $this->assertEquals('clientsecret&tokensecret', $signature->sign($uri));
        $this->assertEquals('PLAINTEXT', $signature->method());
    }

    protected function getMockClientCredentials()
    {
        $clientCredentials = m::mock('League\OAuth1\Client\Credentials\ClientCredentialsInterface');
        $clientCredentials->shouldReceive('getSecret')->andReturn('clientsecret');

        return $clientCredentials;
    }

    protected function getMockCredentials()
    {
        $credentials = m::mock('League\OAuth1\Client\Credentials\CredentialsInterface');
        $credentials->shouldReceive('getSecret')->andReturn('tokensecret');

        return $credentials;
    }
}
