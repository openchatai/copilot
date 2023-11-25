<?php

namespace FiveamCode\LaravelNotionApi\Entities;

use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use FiveamCode\LaravelNotionApi\Exceptions\NotionException;
use Illuminate\Support\Arr;
use JsonSerializable;

/**
 * Class Entity.
 */
class Entity implements JsonSerializable
{
    /**
     * @var string
     */
    private string $id;

    /**
     * @var string
     */
    protected string $objectType = '';

    /**
     * @var array
     */
    protected array $responseData = [];

    /**
     * Entity constructor.
     *
     * @param  array|null  $responseData
     *
     * @throws HandlingException
     * @throws NotionException
     */
    public function __construct(array $responseData = null)
    {
        if ($responseData != null) {
            $this->setResponseData($responseData);
        }
    }

    /**
     * @param  array  $responseData
     *
     * @throws HandlingException
     * @throws NotionException
     */
    protected function setResponseData(array $responseData): void
    {
        if (! Arr::exists($responseData, 'object')) {
            throw new HandlingException('invalid json-array: no object given');
        }

        // TODO
        // Currently, the API returns not-found objects with status code 200 -
        // so we have to check here on the given status code in the paylaod,
        // if the object was not found.
        if (
            $responseData['object'] === 'error'
            && Arr::exists($responseData, 'status') && $responseData['status'] === 404
        ) {
            throw NotionException::instance('Not found', compact('responseData'));
        }

        if (! Arr::exists($responseData, 'id')) {
            throw HandlingException::instance('invalid json-array: no id provided');
        }

        $this->responseData = $responseData;
    }

    protected function fillEssentials(): void
    {
        $this->fillId();
        $this->fillObjectType();
        $this->fillTraitAttributes();
    }

    private function fillTraitAttributes(): void
    {
        $traitMapping = [
            'FiveamCode\LaravelNotionApi\Traits\HasTimestamps' => function ($entity) {
                $entity->fillTimestampableAttributes();
            },
            'FiveamCode\LaravelNotionApi\Traits\HasParent' => function ($entity) {
                $entity->fillParentAttributes();
            },
            'FiveamCode\LaravelNotionApi\Traits\HasArchive' => function ($entity) {
                $entity->fillArchivedAttributes();
            },
        ];

        $traits = $this->class_uses_deep($this);
        foreach ($traits as $trait) {
            if (Arr::exists($traitMapping, $trait)) {
                $traitMapping[$trait]($this);
            }
        }
    }

    private function class_uses_deep($class, $autoload = true)
    {
        $traits = [];

        do {
            $traits = array_merge(class_uses($class, $autoload), $traits);
        } while ($class = get_parent_class($class));

        foreach ($traits as $trait => $same) {
            $traits = array_merge(class_uses($trait, $autoload), $traits);
        }

        return array_unique($traits);
    }

    private function fillId()
    {
        $this->id = $this->responseData['id'];
    }

    private function fillObjectType(): void
    {
        if (Arr::exists($this->responseData, 'object')) {
            $this->objectType = $this->responseData['object'];
        }
    }

    /**
     * @return string
     */
    public function getId(): string
    {
        return $this->id;
    }

    public function setId($id): void
    {
        $this->id = $id;
    }

    /**
     * @return string
     */
    public function getObjectType(): string
    {
        return $this->objectType;
    }

    /**
     * @return array
     */
    public function getRawResponse(): array
    {
        return $this->responseData;
    }

    /**
     * @return array
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    /**
     * @return array
     */
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
