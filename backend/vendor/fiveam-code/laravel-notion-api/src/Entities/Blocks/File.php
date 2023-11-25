<?php

namespace FiveamCode\LaravelNotionApi\Entities\Blocks;

/**
 * Class Paragraph.
 */
class File extends BaseFileBlock
{
    public static function create(string $url, string $caption = ''): File
    {
        $file = new File();
        BaseFileBlock::createFileBlock($file, $url, $caption);

        return $file;
    }

    public function __construct(array $responseData = null)
    {
        $this->type = 'file';
        parent::__construct($responseData);
    }
}
