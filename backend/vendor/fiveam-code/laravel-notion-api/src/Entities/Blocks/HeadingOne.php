<?php

namespace FiveamCode\LaravelNotionApi\Entities\Blocks;

/**
 * Class HeadingOne.
 */
class HeadingOne extends TextBlock
{
    public static function create($textContent): HeadingOne
    {
        self::assertValidTextContent($textContent);

        $headingOne = new HeadingOne();
        TextBlock::createTextBlock($headingOne, $textContent);

        return $headingOne;
    }

    public function __construct(array $responseData = null)
    {
        $this->type = 'heading_1';
        parent::__construct($responseData);
    }
}
