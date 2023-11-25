<?php

namespace FiveamCode\LaravelNotionApi\Entities\Collections;

use FiveamCode\LaravelNotionApi\Entities\Blocks\Block;
use Illuminate\Support\Collection;

/**
 * Class BlockCollection.
 */
class BlockCollection extends EntityCollection
{
    private bool $showUnsupported = false;

    /**
     * will include unsupported blocks within your collection
     * unsupported blocks are currently not supported by the Notion API
     * they will be ignored (not included) in your collection by default.
     *
     * @return BlockCollection
     */
    public function withUnsupported(): BlockCollection
    {
        $this->showUnsupported = true;

        return $this;
    }

    /**
     * collects all blocks from the raw results (from notion).
     */
    protected function collectChildren(): void
    {
        $this->collection = new Collection();
        foreach ($this->rawResults as $blockChildContent) {
            $this->collection->add(Block::fromResponse($blockChildContent));
        }
    }

    /**
     * returns according blocks as collection.
     *
     * @return Collection
     */
    public function asCollection(): Collection
    {
        $collection = parent::asCollection();
        if ($this->showUnsupported) {
            return $collection;
        } else {
            return $collection->filter(function ($block) {
                return $block->getType() !== 'unsupported';
            });
        }
    }

    /**
     * returns according blocks as collection and will only represent the textual content of the blocks
     * (this is useful if you only want to work with the blocks content and not with the whole block object).
     *
     * @return Collection
     */
    public function asTextCollection(): Collection
    {
        $textCollection = new Collection();
        foreach ($this->asCollection() as $block) {
            $textCollection->add($block->asText());
        }

        return $textCollection;
    }
}
