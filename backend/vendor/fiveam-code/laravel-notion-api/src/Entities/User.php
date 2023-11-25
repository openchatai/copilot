<?php

namespace FiveamCode\LaravelNotionApi\Entities;

use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use Illuminate\Support\Arr;

/**
 * Class User.
 */
class User extends Entity
{
    /**
     * @var string
     */
    private string $name;

    /**
     * @var string
     */
    private string $avatarUrl;

    /**
     * @param  array  $responseData
     *
     * @throws HandlingException
     * @throws \FiveamCode\LaravelNotionApi\Exceptions\NotionException
     */
    protected function setResponseData(array $responseData): void
    {
        parent::setResponseData($responseData);
        if ($responseData['object'] !== 'user') {
            throw HandlingException::instance('invalid json-array: the given object is not a user');
        }
        $this->fillFromRaw();
    }

    private function fillFromRaw(): void
    {
        parent::fillEssentials();
        $this->fillName();
        $this->fillAvatarUrl();
    }

    private function fillName(): void
    {
        if (Arr::exists($this->responseData, 'name') && $this->responseData['name'] !== null) {
            $this->name = $this->responseData['name'];
        }
    }

    private function fillAvatarUrl(): void
    {
        if (Arr::exists($this->responseData, 'avatar_url') && $this->responseData['avatar_url'] !== null) {
            $this->avatarUrl = $this->responseData['avatar_url'];
        }
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @return string
     */
    public function getAvatarUrl(): string
    {
        return $this->avatarUrl;
    }
}
