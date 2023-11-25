<?php

namespace FiveamCode\LaravelNotionApi\Entities\PropertyItems;

use FiveamCode\LaravelNotionApi\Entities\Entity;
use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use Illuminate\Support\Arr;

/**
 * Class SelectItem.
 */
class SelectItem extends Entity
{
    /**
     * @var string
     */
    protected string $color;
    /**
     * @var string
     */
    protected string $name;

    /**
     * @param  array  $responseData
     *
     * @throws HandlingException
     */
    protected function setResponseData(array $responseData): void
    {
        if (! Arr::exists($responseData, 'id')) {
            throw HandlingException::instance('invalid json-array: no id provided');
        }
        $this->responseData = $responseData;
        $this->fillFromRaw();
    }

    protected function fillFromRaw(): void
    {
        parent::fillEssentials();
        $this->fillName();
        $this->fillColor();
    }

    protected function fillName(): void
    {
        if (Arr::exists($this->responseData, 'name')) {
            $this->name = $this->responseData['name'];
        }
    }

    protected function fillColor(): void
    {
        if (Arr::exists($this->responseData, 'color')) {
            $this->color = $this->responseData['color'];
        }
    }

    /**
     * @return string
     */
    public function getColor(): string
    {
        return $this->color;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @param $color
     */
    public function setColor($color): void
    {
        $this->color = $color;
    }

    /**
     * @param $name
     */
    public function setName($name): void
    {
        $this->name = $name;
    }
}
