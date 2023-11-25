<?php

namespace League\OAuth1\Client\Tests;

use League\OAuth1\Client\Credentials\ClientCredentialsInterface;
use League\OAuth1\Client\Credentials\RsaClientCredentials;
use League\OAuth1\Client\Signature\RsaSha1Signature;
use Mockery;
use PHPUnit\Framework\TestCase;

class RsaSha1SignatureTest extends TestCase
{
    public function testMethod()
    {
        $signature = new RsaSha1Signature($this->getClientCredentials());
        $this->assertEquals('RSA-SHA1', $signature->method());
    }

    public function testSigningRequest()
    {
        $signature = new RsaSha1Signature($this->getClientCredentials());

        $uri = 'http://www.example.com/?qux=corge';
        $parameters = ['foo' => 'bar', 'baz' => null];

        $this->assertEquals('h8vpV4CYnLwss+rWicKE4sY6AiW2+DT6Fe7qB8jA7LSLhX5jvLEeX1D8E2ynSePSksAY48j+OSLu9vo5juS2duwNK8UA2Rtnnvuj6UFxpx70dpjHAsQg6EbycGptL/SChDkxfpG8LhuwX1FlFa+H0jLYXI5Dy8j90g51GRJbj48=', $signature->sign($uri, $parameters));
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
        $signature = new RsaSha1Signature($this->getClientCredentials());

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

        $this->assertEquals('X9EkmOEbA5CoF2Hicf3ciAumpp1zkKxnVZkh/mEwWyF2DDcrfou9XF11WvbBu3G4loJGeX4GY1FsIrQpsjEILbn0e7Alyii/x8VA9mBwdqMhQVl49jF0pdowocc03M04cAbAOMNObT7tMmDs+YTFgRxEGCiUkq9AizP1cW3+eBo=', $signature->sign($uri, $parameters));
    }

    protected function invokeQueryStringFromData(array $args)
    {
        $signature = new RsaSha1Signature(Mockery::mock(ClientCredentialsInterface::class));
        $refl = new \ReflectionObject($signature);
        $method = $refl->getMethod('queryStringFromData');
        $method->setAccessible(true);

        return $method->invokeArgs($signature, [$args]);
    }

    protected function getClientCredentials()
    {
        $credentials = new RsaClientCredentials();
        $credentials->setRsaPublicKey(__DIR__ . '/test_rsa_publickey.pem');
        $credentials->setRsaPrivateKey(__DIR__ . '/test_rsa_privatekey.pem');

        return $credentials;
    }
}
