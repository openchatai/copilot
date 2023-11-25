<?php

namespace FiveamCode\LaravelNotionApi\Entities\Blocks;

use FiveamCode\LaravelNotionApi\Entities\Contracts\Modifiable;
use FiveamCode\LaravelNotionApi\Entities\PropertyItems\RichText;

/**
 * Class TextBlock.
 */
class TextBlock extends Block implements Modifiable
{
    protected static function createTextBlock(TextBlock $textBlock, $textContent): TextBlock
    {
        self::assertValidTextContent($textContent);

        if (is_string($textContent)) {
            $textContent = [$textContent];
        }

        $text = [];
        foreach ($textContent as $textItem) {
            $text[] = [
                'type' => 'text',
                'text' => [
                    'content' => $textItem,
                ],
            ];
        }

        $textBlock->rawContent = [
            'text' => $text,
        ];

        $textBlock->fillContent();

        return $textBlock;
    }

    public function setContent($content): TextBlock
    {
        $this->getContent()->setPlainText($content);

        $text[] = [
            'type' => 'text',
            'text' => [
                'content' => $content,
            ],
        ];

        $this->rawContent['text'] = $text;

        return $this;
    }

    protected function fillFromRaw(): void
    {
        parent::fillFromRaw();
        $this->fillContent();
    }

    protected function fillContent(): void
    {
        $this->content = new RichText($this->rawContent['text']);
        $this->text = $this->getContent()->getPlainText();
    }

    /**
     * @return RichText
     */
    public function getContent(): RichText
    {
        return $this->content;
    }
}
