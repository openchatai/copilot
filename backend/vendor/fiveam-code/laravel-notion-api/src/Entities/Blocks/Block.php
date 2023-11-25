<?php

namespace FiveamCode\LaravelNotionApi\Entities\Blocks;

use FiveamCode\LaravelNotionApi\Entities\Entity;
use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use FiveamCode\LaravelNotionApi\Traits\HasArchive;
use FiveamCode\LaravelNotionApi\Traits\HasParent;
use FiveamCode\LaravelNotionApi\Traits\HasTimestamps;
use Illuminate\Support\Arr;

/**
 * Class Block.
 */
class Block extends Entity
{
    use HasTimestamps, HasArchive, HasParent;

    /**
     * @var string
     */
    protected string $type;

    /**
     * @var bool
     */
    protected bool $hasChildren;

    /**
     * @var array
     */
    protected array $rawContent;

    /**
     * @var mixed
     */
    protected $content;

    /**
     * @var string
     */
    protected string $text = '[warning: unsupported in notion api]';

    /**
     * @param  array  $responseData
     *
     * @throws HandlingException
     * @throws \FiveamCode\LaravelNotionApi\Exceptions\NotionException
     */
    protected function setResponseData(array $responseData): void
    {
        parent::setResponseData($responseData);
        if ($responseData['object'] !== 'block') {
            throw HandlingException::instance('invalid json-array: the given object is not a block');
        }

        $this->fillFromRaw();
    }

    protected function fillFromRaw(): void
    {
        parent::fillEssentials();
        $this->fillType();
        $this->fillRawContent();
        $this->fillHasChildren();
    }

    private function fillType(): void
    {
        if (Arr::exists($this->responseData, 'type')) {
            $this->type = $this->responseData['type'];
        }
    }

    private function fillRawContent(): void
    {
        if (Arr::exists($this->responseData, $this->getType())) {
            $this->rawContent = $this->responseData[$this->getType()];
        }
    }

    private function fillHasChildren(): void
    {
        if (Arr::exists($this->responseData, 'has_children')) {
            $this->hasChildren = $this->responseData['has_children'];
        }
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return $this->type;
    }

    /**
     * @return string
     */
    public function setType(string $type): void
    {
        $this->type = $type;
    }

    /**
     * @return array
     */
    public function getRawContent(): array
    {
        return $this->rawContent;
    }

    /**
     * @return bool
     */
    public function hasChildren(): bool
    {
        return $this->hasChildren;
    }

    public function getContent()
    {
        return $this->content;
    }

    /**
     * @return string
     */
    public function asText(): string
    {
        return $this->text;
    }

    public function setContent($content)
    {
        $this->content = $content;
    }

    public function setRawContent($rawContent)
    {
        $this->rawContent = $rawContent;
    }

    /**
     * @param $rawContent
     * @return Block
     *
     * @throws HandlingException
     */
    public static function fromResponse($rawContent): Block
    {
        $blockClass = self::mapTypeToClass($rawContent['type']);
        $block = new $blockClass($rawContent);

        return $block;
    }

    /**
     * Maps the type of a block to the corresponding package class by converting the type name.
     *
     * @param  string  $type
     * @return string
     */
    private static function mapTypeToClass(string $type): string
    {
        switch ($type) {
            case 'bulleted_list_item':
            case 'numbered_list_item':
            case 'child_page':
            case 'paragraph':
            case 'to_do':
            case 'toggle':
            case 'embed':
            case 'image':
            case 'video':
            case 'file':
            case 'pdf':
                $class = str_replace('_', '', ucwords($type, '_'));

                return 'FiveamCode\\LaravelNotionApi\\Entities\\Blocks\\'.$class;
            case 'heading_1':
                return HeadingOne::class;
            case 'heading_2':
                return HeadingTwo::class;
            case 'heading_3':
                return HeadingThree::class;
            default:
                return Block::class;
        }
    }

    protected static function assertValidTextContent($textContent)
    {
        if (! is_array($textContent) && ! is_string($textContent)) {
            throw new HandlingException('$textContent content must be a string or an array.');
        }
    }
}
