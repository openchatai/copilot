<?php

namespace FiveamCode\LaravelNotionApi\Entities\Blocks;

/**
 * Class HeadingTwo.
 */
class HeadingTwo extends TextBlock
{
    public static function create($textContent): HeadingTwo
    {
        self::assertValidTextContent($textContent);

        $headingTwo = new HeadingTwo();
        HeadingTwo::createTextBlock($headingTwo, $textContent);

        return $headingTwo;
    }

    public function __construct(array $responseData = null)
    {
        $this->type = 'heading_2';
        parent::__construct($responseData);
    }
}
