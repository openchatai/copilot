<?php

namespace FiveamCode\LaravelNotionApi\Traits;

use Carbon\Carbon;
use DateTime;
use FiveamCode\LaravelNotionApi\Entities\User;
use Illuminate\Support\Arr;

/**
 * Trait HasTimestamps.
 */
trait HasTimestamps
{
    /**
     * @var array
     */
    protected array $responseData = [];

    /**
     * @var DateTime
     */
    protected ?DateTime $createdTime = null;

    /**
     * @var DateTime
     */
    protected ?DateTime $lastEditedTime = null;

    /**
     * @var User
     */
    protected ?User $createdBy = null;

    /**
     * @var User
     */
    protected ?User $lastEditedBy = null;

    protected function fillTimestampableAttributes(): void
    {
        $this->fillCreatedTime();
        $this->fillLastEditedTime();
        $this->fillCreatedBy();
        $this->fillLastEditedBy();
    }

    private function fillCreatedTime(): void
    {
        if (Arr::exists($this->responseData, 'created_time')) {
            $this->createdTime = new Carbon($this->responseData['created_time']);
        }
    }

    private function fillLastEditedTime(): void
    {
        if (Arr::exists($this->responseData, 'last_edited_time')) {
            $this->lastEditedTime = new Carbon($this->responseData['last_edited_time']);
        }
    }

    private function fillCreatedBy(): void
    {
        if (Arr::exists($this->responseData, 'created_by')) {
            $this->createdBy = new User($this->responseData['created_by']);
        }
    }

    private function fillLastEditedBy(): void
    {
        if (Arr::exists($this->responseData, 'last_edited_by')) {
            $this->lastEditedBy = new User($this->responseData['last_edited_by']);
        }
    }

    /**
     * @return ?DateTime
     */
    public function getCreatedTime(): ?DateTime
    {
        return $this->createdTime;
    }

    /**
     * @return ?DateTime
     */
    public function getLastEditedTime(): ?DateTime
    {
        return $this->lastEditedTime;
    }

    /**
     * @return ?User
     */
    public function getCreatedBy(): ?User
    {
        return $this->createdBy;
    }

    /**
     * @return ?User
     */
    public function getLastEditedBy(): ?User
    {
        return $this->lastEditedBy;
    }
}
