<?php

namespace League\OAuth1\Client\Tests;

use Generator;
use League\OAuth1\Client\Server\Twitter;
use PHPUnit\Framework\TestCase;

class TwitterServerTest extends TestCase
{
    public function sampleTemporaryCredentialUrls(): Generator
    {
        yield 'No application scope' => [
            null, 'https://api.twitter.com/oauth/request_token',
        ];

        yield "Read" => [
            'read', 'https://api.twitter.com/oauth/request_token?x_auth_access_type=read',
        ];

        yield "Write" => [
            'write', 'https://api.twitter.com/oauth/request_token?x_auth_access_type=write',
        ];
    }

    /** @dataProvider sampleTemporaryCredentialUrls */
    public function testItProvidesNoApplicationScopeByDefault(?string $applicationScope, string $url): void
    {
        $twitter = new Twitter([
            'identifier' => 'mykey',
            'secret' => 'mysecret',
            'callback_uri' => 'http://app.dev/',
            'scope' => $applicationScope,
        ]);

        self::assertEquals($url, $twitter->urlTemporaryCredentials());
    }
}
