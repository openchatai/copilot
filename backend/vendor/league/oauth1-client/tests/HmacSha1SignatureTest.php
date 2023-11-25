<?php

namespace League\OAuth1\Client\Tests;

use League\OAuth1\Client\Signature\HmacSha1Signature;
use Mockery as m;
use PHPUnit\Framework\TestCase;

class HmacSha1SignatureTest extends TestCase
{
    protected function tearDown(): void
    {
        m::close();

        parent::tearDown();
    }

    public function testSigningRequest()
    {
        $signature = new HmacSha1Signature($this->getMockClientCredentials());

        $uri = 'http://www.example.com/?qux=corge';
        $parameters = ['foo' => 'bar', 'baz' => null];

        $this->assertEquals('A3Y7C1SUHXR1EBYIUlT3d6QT1cQ=', $signature->sign($uri, $parameters));
    }

    public function testSigningRequestWhereThePortIsNotStandard()
    {
        $signature = new HmacSha1Signature($this->getMockClientCredentials());

        $uri = 'http://www.example.com:8080/?qux=corge';
        $parameters = ['foo' => 'bar', 'baz' => null];

        $this->assertEquals('ECcWxyi5UOC1G0MxH0ygm6Pd6JE=', $signature->sign($uri, $parameters));
    }

    public function testQueryStringFromArray()
    {
        $array = ['a' => 'b'];
        $res = $this->invokeQueryStringFromData($array);

        $this->assertSame(
            'a%3Db',
            $res
        );
    }

    public function testQueryStringFromIndexedArray()
    {
        $array = ['a', 'b'];
        $res = $this->invokeQueryStringFromData($array);

        $this->assertSame(
            '0%3Da%261%3Db',
            $res
        );
    }

    public function testQueryStringFromMultiDimensionalArray()
    {
        $array = [
            'a' => [
                'b' => [
                    'c' => 'd',
                ],
                'e' => [
                    'f' => 'g',
                ],
            ],
            'h' => 'i',
            'empty' => '',
            'null' => null,
            'false' => false,
        ];

        // Convert to query string.
        $res = $this->invokeQueryStringFromData($array);

        $this->assertSame(
            'a%5Bb%5D%5Bc%5D%3Dd%26a%5Be%5D%5Bf%5D%3Dg%26h%3Di%26empty%3D%26null%3D%26false%3D',
            $res
        );

        // Reverse engineer the string.
        $res = urldecode($res);

        $this->assertSame(
            'a[b][c]=d&a[e][f]=g&h=i&empty=&null=&false=',
            $res
        );

        // Finally, parse the string back to an array.
        parse_str($res, $original_array);

        // And ensure it matches the orignal array (approximately).
        $this->assertSame(
            [
                'a' => [
                    'b' => [
                        'c' => 'd',
                    ],
                    'e' => [
                        'f' => 'g',
                    ],
                ],
                'h' => 'i',
                'empty' => '',
                'null' => '', // null value gets lost in string translation
                'false' => '', // false value gets lost in string translation
            ],
            $original_array
        );
    }

    public function testSigningRequestWithMultiDimensionalParams()
    {
        $signature = new HmacSha1Signature($this->getMockClientCredentials());

        $uri = 'http://www.example.com/';
        $parameters = [
            'a' => [
                'b' => [
                    'c' => 'd',
                ],
                'e' => [
                    'f' => 'g',
                ],
            ],
            'h' => 'i',
            'empty' => '',
            'null' => null,
            'false' => false,
        ];

        $this->assertEquals('ZUxiJKugeEplaZm9e4hshN0I70U=', $signature->sign($uri, $parameters));
    }

    protected function invokeQueryStringFromData(array $args)
    {
        $signature = new HmacSha1Signature(m::mock('League\OAuth1\Client\Credentials\ClientCredentialsInterface'));
        $refl = new \ReflectionObject($signature);
        $method = $refl->getMethod('queryStringFromData');
        $method->setAccessible(true);

        return $method->invokeArgs($signature, [$args]);
    }

    protected function getMockClientCredentials()
    {
        $clientCredentials = m::mock('League\OAuth1\Client\Credentials\ClientCredentialsInterface');
        $clientCredentials->shouldReceive('getSecret')->andReturn('clientsecret');

        return $clientCredentials;
    }
}
