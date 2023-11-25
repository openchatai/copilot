<?php

namespace League\OAuth1\Client\Server;

use League\OAuth1\Client\Credentials\TokenCredentials;

class Twitter extends Server
{
    /**
     * Application scope.
     *
     * @var ?string
     */
    protected $applicationScope = null;

    /**
     * @inheritDoc
     */
    public function __construct($clientCredentials, SignatureInterface $signature = null)
    {
        parent::__construct($clientCredentials, $signature);

        if (is_array($clientCredentials)) {
            $this->parseConfiguration($clientCredentials);
        }
    }

    /**
     * Set the application scope.
     *
     * @param ?string $applicationScope
     *
     * @return Twitter
     */
    public function setApplicationScope($applicationScope)
    {
        $this->applicationScope = $applicationScope;

        return $this;
    }

    /**
     * Get application scope.
     *
     * @return ?string
     */
    public function getApplicationScope()
    {
        return $this->applicationScope;
    }

    /**
     * @inheritDoc
     */
    public function urlTemporaryCredentials()
    {
        $url = 'https://api.twitter.com/oauth/request_token';
        $queryParams = $this->temporaryCredentialsQueryParameters();

        return empty($queryParams) ? $url : $url . '?' . $queryParams;
    }

    /**
     * @inheritDoc
     */
    public function urlAuthorization()
    {
        return 'https://api.twitter.com/oauth/authenticate';
    }

    /**
     * @inheritDoc
     */
    public function urlTokenCredentials()
    {
        return 'https://api.twitter.com/oauth/access_token';
    }

    /**
     * @inheritDoc
     */
    public function urlUserDetails()
    {
        return 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true';
    }

    /**
     * @inheritDoc
     */
    public function userDetails($data, TokenCredentials $tokenCredentials)
    {
        $user = new User();

        $user->uid = $data['id_str'];
        $user->nickname = $data['screen_name'];
        $user->name = $data['name'];
        $user->location = $data['location'];
        $user->description = $data['description'];
        $user->imageUrl = $data['profile_image_url'];

        if (isset($data['email'])) {
            $user->email = $data['email'];
        }

        $used = ['id', 'screen_name', 'name', 'location', 'description', 'profile_image_url', 'email'];

        foreach ($data as $key => $value) {
            if (strpos($key, 'url') !== false) {
                if ( ! in_array($key, $used)) {
                    $used[] = $key;
                }

                $user->urls[$key] = $value;
            }
        }

        // Save all extra data
        $user->extra = array_diff_key($data, array_flip($used));

        return $user;
    }

    /**
     * @inheritDoc
     */
    public function userUid($data, TokenCredentials $tokenCredentials)
    {
        return $data['id'];
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
        return $data['name'];
    }

    /**
     * Query parameters for a Twitter OAuth request to get temporary credentials.
     *
     * @return string
     */
    protected function temporaryCredentialsQueryParameters()
    {
        $queryParams = [];

        if ($scope = $this->getApplicationScope()) {
            $queryParams['x_auth_access_type'] = $scope;
        }

        return http_build_query($queryParams);
    }

    /**
     * Parse configuration array to set attributes.
     *
     * @param array $configuration
     *
     * @return void
     */
    private function parseConfiguration(array $configuration = [])
    {
        $configToPropertyMap = [
            'scope' => 'applicationScope',
        ];

        foreach ($configToPropertyMap as $config => $property) {
            if (isset($configuration[$config])) {
                $this->$property = $configuration[$config];
            }
        }
    }
}
