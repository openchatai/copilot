<?php

namespace FiveamCode\LaravelNotionApi\Entities\Blocks;

/**
 * Class Paragraph.
 */
class Video extends BaseFileBlock
{
    public static function create(string $url, string $caption = ''): Video
    {
        $video = new Video();
        BaseFileBlock::createFileBlock($video, $url, $caption);

        return $video;
    }

    public function __construct(array $responseData = null)
    {
        $this->type = 'video';
        parent::__construct($responseData);
    }
}
