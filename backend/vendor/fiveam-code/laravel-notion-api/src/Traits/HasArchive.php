<?php

namespace FiveamCode\LaravelNotionApi\Traits;

use Illuminate\Support\Arr;

/**
 * Trait HasArchive.
 */
trait HasArchive
{
    /**
     * @var array
     */
    protected array $responseData = [];

    /**
     * @var bool
     */
    private bool $archived = false;

    protected function fillArchivedAttributes(): void
    {
        $this->fillArchived();
    }

    private function fillArchived(): void
    {
        if (Arr::exists($this->responseData, 'archived')) {
            $this->archived = $this->responseData['archived'];
        }
    }

    /**
     * @return bool
     */
    public function isArchived(): bool
    {
        return $this->archived;
    }
}
