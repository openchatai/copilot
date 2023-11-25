<?php

namespace FiveamCode\LaravelNotionApi\Entities\Properties;

use Illuminate\Support\Collection;

/**
 * Class Files.
 */
class Files extends Property
{
    protected function fillFromRaw(): void
    {
        parent::fillFromRaw();
        $this->fillFiles();
    }

    protected function fillFiles(): void
    {
        $this->content = new Collection();
        foreach ($this->rawContent as $file) {
            $this->content->add($file);
        }
    }

    /**
     * @return Collection
     */
    public function getContent(): Collection
    {
        return $this->content;
    }

    /**
     * @return Collection
     */
    public function getFiles(): Collection
    {
        return $this->content;
    }
}
