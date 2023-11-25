<?php

namespace League\OAuth1\Client\Server;

use League\OAuth1\Client\Credentials\TokenCredentials;
use LogicException;
use RuntimeException;

class Tumblr extends Server
{
    /**
     * @inheritDoc
     */
    public function urlTemporaryCredentials()
    {
        return 'https://www.tumblr.com/oauth/request_token';
    }

    /**
     * @inheritDoc
     */
    public function urlAuthorization()
    {
        return 'https://www.tumblr.com/oauth/authorize';
    }

    /**
     * @inheritDoc
     */
    public function urlTokenCredentials()
    {
        return 'https://www.tumblr.com/oauth/access_token';
    }

    /**
     * @inheritDoc
     */
    public function urlUserDetails()
    {
        return 'https://api.tumblr.com/v2/user/info';
    }

    /**
     * @inheritDoc
     */
    public function userDetails($data, TokenCredentials $tokenCredentials)
    {
        // If the API has broke, return nothing
        if ( ! isset($data['response']['user']) || ! is_array($data['response']['user'])) {
            throw new LogicException('Not possible to get user info');
        }

        $data = $data['response']['user'];

        $user = new User();

        $user->nickname = $data['name'];

        // Save all extra data
        $used = ['name'];
        $user->extra = array_diff_key($data, array_flip($used));

        return $user;
    }

    /**
     * @inheritDoc
     */
    public function userUid($data, TokenCredentials $tokenCredentials)
    {
        if ( ! isset($data['response']['user']) || ! is_array($data['response']['user'])) {
            throw new LogicException('Not possible to get user UUID');
        }

        $data = $data['response']['user'];

        return $data['name'];
    }

    /**
     * @inheritDoc
     */
    public function userEmail($data, TokenCredentials $tokenCredentials)
    {
        return null;
    }

    /**
     * @inheritDoc
     */
    public function userScreenName($data, TokenCredentials $tokenCredentials)
    {
        if ( ! isset($data['response']['user']) || ! is_array($data['response']['user'])) {
            throw new LogicException('Not possible to get user screen name');
        }

        $data = $data['response']['user'];

        return $data['name'];
    }
}
