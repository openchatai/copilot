<?php

namespace FiveamCode\LaravelNotionApi\Entities\Blocks;

/**
 * Class BulletedListItem.
 */
class BulletedListItem extends TextBlock
{
    public static function create($textContent): BulletedListItem
    {
        self::assertValidTextContent($textContent);

        $bulletedListItem = new BulletedListItem();
        TextBlock::createTextBlock($bulletedListItem, $textContent);

        return $bulletedListItem;
    }

    public function __construct(array $responseData = null)
    {
        $this->type = 'bulleted_list_item';
        parent::__construct($responseData);
    }
}
