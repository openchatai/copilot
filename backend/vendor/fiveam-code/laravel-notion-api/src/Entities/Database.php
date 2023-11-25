<?php

namespace FiveamCode\LaravelNotionApi\Entities;

use FiveamCode\LaravelNotionApi\Entities\Properties\Property;
use FiveamCode\LaravelNotionApi\Entities\PropertyItems\RichText;
use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use FiveamCode\LaravelNotionApi\Traits\HasArchive;
use FiveamCode\LaravelNotionApi\Traits\HasParent;
use FiveamCode\LaravelNotionApi\Traits\HasTimestamps;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

/**
 * Class Database.
 */
class Database extends Entity
{
    use HasTimestamps, HasArchive, HasParent;

    /**
     * @var string
     */
    protected string $title = '';

    /**
     * @var string
     */
    protected string $description = '';

    /**
     * @var string
     */
    private string $icon = '';

    /**
     * @var string
     */
    private string $iconType = '';

    /**
     * @var string
     */
    private string $cover = '';

    /**
     * @var string
     */
    private string $coverType = '';

    /**
     * @var string
     */
    private string $url;

    /**
     * @var ?RichText
     */
    protected ?RichText $richTitle = null;

    /**
     * @var ?RichText
     */
    protected ?RichText $richDescription = null;

    /**
     * @var bool
     */
    protected bool $isInline = false;

    /**
     * @var array
     */
    protected array $rawProperties = [];

    /**
     * @var array
     */
    protected array $propertyKeys = [];

    /**
     * @var array
     */
    protected array $propertyMap = [];

    /**
     * @var Collection
     */
    protected Collection $properties;

    protected function setResponseData(array $responseData): void
    {
        parent::setResponseData($responseData);
        if ($responseData['object'] !== 'database') {
            throw HandlingException::instance('invalid json-array: the given object is not a database');
        }
        $this->fillFromRaw();
    }

    private function fillFromRaw()
    {
        parent::fillEssentials();
        $this->fillIcon();
        $this->fillCover();
        $this->fillTitle();
        $this->fillIsInline();
        $this->fillDescription();
        $this->fillProperties();
        $this->fillDatabaseUrl();
    }

    private function fillTitle(): void
    {
        if (Arr::exists($this->responseData, 'title') && is_array($this->responseData['title'])) {
            $this->title = Arr::first($this->responseData['title'], null, ['plain_text' => ''])['plain_text'];
            $this->richTitle = new RichText($this->responseData['title']);
        }
    }

    private function fillIsInline(): void
    {
        if (Arr::exists($this->responseData, 'is_inline')) {
            $this->isInline = $this->responseData['is_inline'];
        }
    }

    private function fillDescription(): void
    {
        if (Arr::exists($this->responseData, 'description') && is_array($this->responseData['description'])) {
            $this->description = Arr::first($this->responseData['description'], null, ['plain_text' => ''])['plain_text'];
            $this->richDescription = new RichText($this->responseData['description']);
        }
    }

    private function fillDatabaseUrl(): void
    {
        if (Arr::exists($this->responseData, 'url')) {
            $this->url = $this->responseData['url'];
        }
    }

    private function fillIcon(): void
    {
        if (Arr::exists($this->responseData, 'icon') && $this->responseData['icon'] != null) {
            $this->iconType = $this->responseData['icon']['type'];
            if (Arr::exists($this->responseData['icon'], 'emoji')) {
                $this->icon = $this->responseData['icon']['emoji'];
            } elseif (Arr::exists($this->responseData['icon'], 'file')) {
                $this->icon = $this->responseData['icon']['file']['url'];
            } elseif (Arr::exists($this->responseData['icon'], 'external')) {
                $this->icon = $this->responseData['icon']['external']['url'];
            }
        }
    }

    private function fillCover(): void
    {
        if (Arr::exists($this->responseData, 'cover') && $this->responseData['cover'] != null) {
            $this->coverType = $this->responseData['cover']['type'];
            if (Arr::exists($this->responseData['cover'], 'file')) {
                $this->cover = $this->responseData['cover']['file']['url'];
            } elseif (Arr::exists($this->responseData['cover'], 'external')) {
                $this->cover = $this->responseData['cover']['external']['url'];
            }
        }
    }

    private function fillProperties(): void
    {
        if (Arr::exists($this->responseData, 'properties')) {
            $this->rawProperties = $this->responseData['properties'];
            $this->propertyKeys = array_keys($this->rawProperties);
            $this->properties = new Collection();

            foreach ($this->rawProperties as $propertyKey => $propertyContent) {
                $propertyObj = Property::fromResponse($propertyKey, $propertyContent);
                $this->properties->add($propertyObj);
                $this->propertyMap[$propertyKey] = $propertyObj;
            }
        }
    }

    /**
     * @param  string  $propertyKey
     * @return Property|null
     */
    public function getProperty(string $propertyKey): ?Property
    {
        if (! isset($this->propertyMap[$propertyKey])) {
            return null;
        }

        return $this->propertyMap[$propertyKey];
    }

    /**
     * @return string
     */
    public function getTitle(): string
    {
        return $this->title;
    }

    /**
     * @return bool
     */
    public function isInline(): bool
    {
        return $this->isInline;
    }

    /**
     * @return string
     */
    public function getDescription(): string
    {
        return $this->description;
    }

    /**
     * @return string
     */
    public function getUrl(): string
    {
        return $this->url;
    }

    /**
     * @return string
     */
    public function getIcon(): string
    {
        return $this->icon;
    }

    /**
     * @return string
     */
    public function getIconType(): string
    {
        return $this->iconType;
    }

    /**
     * @return string
     */
    public function getCover(): string
    {
        return $this->cover;
    }

    /**
     * @return string
     */
    public function getCoverType(): string
    {
        return $this->coverType;
    }

    /**
     * @return Collection
     */
    public function getProperties(): Collection
    {
        return $this->properties;
    }

    /**
     * @return ?RichText
     */
    public function getRichTitle(): ?RichText
    {
        return $this->richTitle;
    }

    /**
     * @return ?RichText
     */
    public function getRichDescription(): ?RichText
    {
        return $this->richDescription;
    }

    /**
     * @return array
     */
    public function getRawProperties(): array
    {
        return $this->rawProperties;
    }

    /**
     * @return array
     */
    public function getPropertyKeys(): array
    {
        return $this->propertyKeys;
    }
}
