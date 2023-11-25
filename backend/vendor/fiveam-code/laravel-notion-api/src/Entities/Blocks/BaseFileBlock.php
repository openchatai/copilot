<?php

namespace FiveamCode\LaravelNotionApi\Entities\Blocks;

use FiveamCode\LaravelNotionApi\Entities\Contracts\Modifiable;
use FiveamCode\LaravelNotionApi\Entities\PropertyItems\RichText;

/**
 * Class TextBlock.
 */
class BaseFileBlock extends Block implements Modifiable
{
    final protected static function createFileBlock(BaseFileBlock $fileBlock, string $url, string $caption = ''): BaseFileBlock
    {
        $fileBlock->rawContent = [
            'type' => 'external',
            'caption' => [
                [
                    'type' => 'text',
                    'text' => [
                        'content' => $caption,
                    ],
                ],
            ],
            'external' => [
                'url' => $url,
            ],
        ];

        $fileBlock->fillContent();

        return $fileBlock;
    }

    private string $hostingType = '';
    private string $url = '';
    private RichText $caption;

    protected function fillFromRaw(): void
    {
        parent::fillFromRaw();
        $this->fillContent();
    }

    protected function fillContent(): void
    {
        $this->hostingType = $this->rawContent['type'];
        $this->url = $this->rawContent[$this->hostingType]['url'];
        $this->caption = new RichText($this->rawContent['caption']);
        $this->content = $this->url;
    }

    public function getUrl()
    {
        return $this->url;
    }

    public function getHostingType()
    {
        return $this->hostingType;
    }

    public function getCaption()
    {
        return $this->caption;
    }
}
