<?php

namespace FiveamCode\LaravelNotionApi\Entities\Blocks;

/**
 * Class Paragraph.
 */
class Image extends BaseFileBlock
{
    public static function create(string $url, string $caption = ''): Image
    {
        $image = new Image();
        BaseFileBlock::createFileBlock($image, $url, $caption);

        return $image;
    }

    public function __construct(array $responseData = null)
    {
        $this->type = 'image';
        parent::__construct($responseData);
    }
}
