<?php

namespace FiveamCode\LaravelNotionApi\Entities\Blocks;

/**
 * Class Toggle.
 */
class Toggle extends TextBlock
{
    public static function create($textContent): Toggle
    {
        self::assertValidTextContent($textContent);

        $toggle = new Toggle();
        TextBlock::createTextBlock($toggle, $textContent);

        return $toggle;
    }

    public function __construct(array $responseData = null)
    {
        $this->type = 'toggle';
        parent::__construct($responseData);
    }
}
