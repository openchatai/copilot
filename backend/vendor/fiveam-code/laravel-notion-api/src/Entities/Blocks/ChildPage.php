<?php

namespace FiveamCode\LaravelNotionApi\Entities\Blocks;

/**
 * Class ChildPage.
 */
class ChildPage extends Block
{
    public function __construct(array $responseData = null)
    {
        $this->type = 'child_page';
        parent::__construct($responseData);
    }

    protected function fillFromRaw(): void
    {
        parent::fillFromRaw();
        $this->fillContent();
    }

    protected function fillContent(): void
    {
        $this->content = $this->rawContent['title'];
        $this->text = $this->getContent();
    }

    /**
     * @return string
     */
    public function getContent(): string
    {
        return $this->content;
    }
}
