<?php

namespace League\OAuth1\Client\Tests;

use League\OAuth1\Client\Credentials\CredentialsException;
use League\OAuth1\Client\Credentials\RsaClientCredentials;
use OpenSSLAsymmetricKey;
use PHPUnit\Framework\TestCase;

class RsaClientCredentialsTest extends TestCase
{
    public function testGetRsaPublicKey()
    {
        $credentials = new RsaClientCredentials();
        $credentials->setRsaPublicKey(__DIR__ . '/test_rsa_publickey.pem');

        /** @var resource|OpenSSLAsymmetricKey $key */
        $key = $credentials->getRsaPublicKey();
        $this->assertFalse(is_null($key));

        $this->assertEquals($key, $credentials->getRsaPublicKey());
    }

    public function testGetRsaPublicKeyNotExists()
    {
        $this->expectException(CredentialsException::class);

        $credentials = new RsaClientCredentials();
        $credentials->setRsaPublicKey('fail');

        $credentials->getRsaPublicKey();
    }

    public function testGetRsaPublicKeyInvalid()
    {
        $this->expectException(CredentialsException::class);

        $credentials = new RsaClientCredentials();
        $credentials->setRsaPublicKey(__DIR__ . '/test_rsa_invalidkey.pem');

        $credentials->getRsaPublicKey();
    }

    public function testGetRsaPrivateKey()
    {
        $credentials = new RsaClientCredentials();
        $credentials->setRsaPrivateKey(__DIR__ . '/test_rsa_privatekey.pem');

        /** @var resource|OpenSSLAsymmetricKey $key */
        $key = $credentials->getRsaPrivateKey();
        $this->assertFalse(is_null($key));

        $this->assertEquals($key, $credentials->getRsaPrivateKey());
    }

    public function testGetRsaPrivateKeyNotExists()
    {
        $this->expectException(CredentialsException::class);

        $credentials = new RsaClientCredentials();
        $credentials->setRsaPrivateKey('fail');

        $credentials->getRsaPrivateKey();
    }

    public function testGetRsaPrivateKeyInvalid()
    {
        $this->expectException(CredentialsException::class);

        $credentials = new RsaClientCredentials();
        $credentials->setRsaPrivateKey(__DIR__ . '/test_rsa_invalidkey.pem');

        $credentials->getRsaPrivateKey();
    }
}
