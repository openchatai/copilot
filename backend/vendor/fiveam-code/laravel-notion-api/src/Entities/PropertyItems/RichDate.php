<?php

namespace FiveamCode\LaravelNotionApi\Entities\PropertyItems;

use DateTime;
use FiveamCode\LaravelNotionApi\Entities\Entity;
use Illuminate\Support\Arr;

/**
 * Class RichDate.
 */
class RichDate extends Entity
{
    protected DateTime $start;
    protected ?DateTime $end = null;
    protected bool $hasTime = false;

    /**
     * @param  array  $responseData
     */
    protected function setResponseData(array $responseData): void
    {
        $this->responseData = $responseData;
        $this->fillFromRaw();
    }

    protected function fillFromRaw(): void
    {
        $this->fillFrom();
        $this->fillTo();
    }

    protected function fillFrom(): void
    {
        if (Arr::exists($this->responseData, 'from')) {
            $this->from .= $this->responseData['from'];
        }
    }

    protected function fillTo(): void
    {
        if (Arr::exists($this->responseData, 'to')) {
            $this->from .= $this->responseData['to'];
        }
    }

    /**
     * @return bool
     */
    public function isRange(): bool
    {
        return $this->end != null;
    }

    /**
     * @return DateTime
     */
    public function getStart(): ?DateTime
    {
        return $this->start;
    }

    /**
     * @return ?DateTime
     */
    public function getEnd(): ?DateTime
    {
        return $this->end;
    }

    /**
     * @return bool
     */
    public function hasTime(): bool
    {
        return $this->hasTime;
    }

    public function setStart($start): void
    {
        $this->start = $start;
    }

    public function setEnd($end): void
    {
        $this->end = $end;
    }

    public function setHasTime($hasTime): void
    {
        $this->hasTime = $hasTime;
    }
}
