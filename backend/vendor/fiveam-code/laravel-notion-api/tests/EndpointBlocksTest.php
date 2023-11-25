<?php

namespace FiveamCode\LaravelNotionApi\Tests;

use FiveamCode\LaravelNotionApi\Entities\Blocks\Block;
use FiveamCode\LaravelNotionApi\Entities\Blocks\BulletedListItem;
use FiveamCode\LaravelNotionApi\Entities\Blocks\Embed;
use FiveamCode\LaravelNotionApi\Entities\Blocks\File;
use FiveamCode\LaravelNotionApi\Entities\Blocks\HeadingOne;
use FiveamCode\LaravelNotionApi\Entities\Blocks\HeadingThree;
use FiveamCode\LaravelNotionApi\Entities\Blocks\HeadingTwo;
use FiveamCode\LaravelNotionApi\Entities\Blocks\Image;
use FiveamCode\LaravelNotionApi\Entities\Blocks\NumberedListItem;
use FiveamCode\LaravelNotionApi\Entities\Blocks\Paragraph;
use FiveamCode\LaravelNotionApi\Entities\Blocks\Pdf;
use FiveamCode\LaravelNotionApi\Entities\Blocks\ToDo;
use FiveamCode\LaravelNotionApi\Entities\Blocks\Toggle;
use FiveamCode\LaravelNotionApi\Entities\Blocks\Video;
use FiveamCode\LaravelNotionApi\Entities\Collections\BlockCollection;
use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use FiveamCode\LaravelNotionApi\Exceptions\NotionException;
use Illuminate\Support\Facades\Http;
use Notion;

/**
 * Class EndpointBlocksTest.
 *
 * The fake API responses are based on Notions documentation.
 *
 * @see https://developers.notion.com/reference/get-block-children
 */
class EndpointBlocksTest extends NotionApiTest
{
    /** @test */
    public function it_throws_a_notion_exception_bad_request()
    {
        // failing /v1/blocks
        Http::fake([
            'https://api.notion.com/v1/blocks/b55c9c91-384d-452b-81db-d1ef79372b76/children*' => Http::response(
                json_decode('{}', true),
                400,
                ['Headers']
            ),
        ]);

        $this->expectException(NotionException::class);
        $this->expectExceptionMessage('Bad Request');
        $this->expectExceptionCode(400);

        Notion::block('b55c9c91-384d-452b-81db-d1ef79372b76')->children();
    }

    /** @test */
    public function it_returns_block_collection_with_children()
    {
        // successful /v1/blocks/BLOCK_DOES_EXIST/children
        Http::fake([
            'https://api.notion.com/v1/blocks/b55c9c91-384d-452b-81db-d1ef79372b76/children*' => Http::response(
                json_decode(file_get_contents('tests/stubs/endpoints/blocks/response_specific_block_children_200.json'), true),
                200,
                ['Headers']
            ),
        ]);

        $blockChildren = Notion::block('b55c9c91-384d-452b-81db-d1ef79372b76')->children();
        $this->assertInstanceOf(BlockCollection::class, $blockChildren);

        $blockChildrenCollection = $blockChildren->asCollection();
        $this->assertContainsOnly(Block::class, $blockChildrenCollection);
        $this->assertIsIterable($blockChildrenCollection);
        $this->assertCount(3, $blockChildrenCollection);

        // check first child
        $blockChild = $blockChildrenCollection->first();
        $this->assertInstanceOf(Block::class, $blockChild);
        $this->assertEquals('heading_2', $blockChild->getType());
        $this->assertFalse($blockChild->hasChildren());
        $this->assertArrayHasKey('text', $blockChild->getRawContent());
        $this->assertArrayHasKey(0, $blockChild->getRawContent()['text']);
        $this->assertArrayHasKey('plain_text', $blockChild->getRawContent()['text'][0]);
        $this->assertEquals('Lacinato kale', $blockChild->getRawContent()['text'][0]['plain_text']);
    }

    /** @test */
    public function it_returns_block_collection_with_children_as_correct_instances()
    {
        // successful /v1/blocks/BLOCK_DOES_EXIST/children
        Http::fake([
            'https://api.notion.com/v1/blocks/1d719dd1-563b-4387-b74f-20da92b827fb/children*' => Http::response(
                json_decode(file_get_contents('tests/stubs/endpoints/blocks/response_specific_supported_blocks_200.json'), true),
                200,
                ['Headers']
            ),
        ]);

        $blockChildren = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->children();
        $this->assertInstanceOf(BlockCollection::class, $blockChildren);

        // check collection
        $blockChildrenCollection = $blockChildren->asCollection();
        $this->assertContainsOnly(Block::class, $blockChildrenCollection);
        $this->assertIsIterable($blockChildrenCollection);
        $this->assertCount(13, $blockChildrenCollection);

        // check paragraph
        $blockChild = $blockChildrenCollection[0];
        $this->assertInstanceOf(Paragraph::class, $blockChild);
        $this->assertEquals('paragraph', $blockChild->getType());
        $this->assertFalse($blockChild->hasChildren());
        $this->assertEquals('paragraph_block', $blockChild->getContent()->getPlainText());

        // check heading_1
        $blockChild = $blockChildrenCollection[1];
        $this->assertInstanceOf(HeadingOne::class, $blockChild);
        $this->assertEquals('heading_1', $blockChild->getType());
        $this->assertFalse($blockChild->hasChildren());
        $this->assertEquals('heading_one_block', $blockChild->getContent()->getPlainText());

        // check heading_2
        $blockChild = $blockChildrenCollection[2];
        $this->assertInstanceOf(HeadingTwo::class, $blockChild);
        $this->assertEquals('heading_2', $blockChild->getType());
        $this->assertFalse($blockChild->hasChildren());
        $this->assertEquals('heading_two_block', $blockChild->getContent()->getPlainText());

        // check heading_3
        $blockChild = $blockChildrenCollection[3];
        $this->assertInstanceOf(HeadingThree::class, $blockChild);
        $this->assertEquals('heading_3', $blockChild->getType());
        $this->assertFalse($blockChild->hasChildren());
        $this->assertEquals('heading_three_block', $blockChild->getContent()->getPlainText());

        // check bulleted_list_item
        $blockChild = $blockChildrenCollection[4];
        $this->assertInstanceOf(BulletedListItem::class, $blockChild);
        $this->assertEquals('bulleted_list_item', $blockChild->getType());
        $this->assertFalse($blockChild->hasChildren());
        $this->assertEquals('bulleted_list_item_block', $blockChild->getContent()->getPlainText());

        // check numbered_list_item
        $blockChild = $blockChildrenCollection[5];
        $this->assertInstanceOf(NumberedListItem::class, $blockChild);
        $this->assertEquals('numbered_list_item', $blockChild->getType());
        $this->assertFalse($blockChild->hasChildren());
        $this->assertEquals('numbered_list_item_block', $blockChild->getContent()->getPlainText());

        // check to_do
        $blockChild = $blockChildrenCollection[6];
        $this->assertInstanceOf(ToDo::class, $blockChild);
        $this->assertEquals('to_do', $blockChild->getType());
        $this->assertFalse($blockChild->hasChildren());
        $this->assertEquals('to_do_block', $blockChild->getContent()->getPlainText());

        // check toggle
        $blockChild = $blockChildrenCollection[7];
        $this->assertInstanceOf(Toggle::class, $blockChild);
        $this->assertEquals('toggle', $blockChild->getType());
        $this->assertFalse($blockChild->hasChildren());
        $this->assertEquals('toggle_block', $blockChild->getContent()->getPlainText());

        // check embed
        $blockChild = $blockChildrenCollection[8];
        $this->assertInstanceOf(Embed::class, $blockChild);
        $this->assertEquals('embed', $blockChild->getType());
        $this->assertFalse($blockChild->hasChildren());
        $this->assertEquals('Testcaption', $blockChild->getCaption()->getPlainText());
        $this->assertEquals('https://notion.so', $blockChild->getUrl());

        // check image
        $blockChild = $blockChildrenCollection[9];
        $this->assertInstanceOf(Image::class, $blockChild);
        $this->assertEquals('image', $blockChild->getType());
        $this->assertFalse($blockChild->hasChildren());
        $this->assertEquals('test', $blockChild->getCaption()->getPlainText());
        $this->assertEquals('external', $blockChild->getHostingType());
        $this->assertEquals('https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb', $blockChild->getUrl());

        // check file
        $blockChild = $blockChildrenCollection[10];
        $this->assertInstanceOf(File::class, $blockChild);
        $this->assertEquals('file', $blockChild->getType());
        $this->assertFalse($blockChild->hasChildren());
        $this->assertEquals('TestCaption', $blockChild->getCaption()->getPlainText());
        $this->assertEquals('external', $blockChild->getHostingType());
        $this->assertEquals('https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb', $blockChild->getUrl());

        // check video
        $blockChild = $blockChildrenCollection[11];
        $this->assertInstanceOf(Video::class, $blockChild);
        $this->assertEquals('video', $blockChild->getType());
        $this->assertFalse($blockChild->hasChildren());
        $this->assertEquals('TestCaption', $blockChild->getCaption()->getPlainText());
        $this->assertEquals('external', $blockChild->getHostingType());
        $this->assertEquals('https://www.w3schools.com/html/mov_bbb.mp4', $blockChild->getUrl());

        // check pdf
        $blockChild = $blockChildrenCollection[12];
        $this->assertInstanceOf(Pdf::class, $blockChild);
        $this->assertEquals('pdf', $blockChild->getType());
        $this->assertFalse($blockChild->hasChildren());
        $this->assertEquals('TestCaption', $blockChild->getCaption()->getPlainText());
        $this->assertEquals('external', $blockChild->getHostingType());
        $this->assertEquals('https://notion.so/testpdf.pdf', $blockChild->getUrl());
    }

    /** @test */
    public function it_throws_a_notion_exception_not_found()
    {
        // failing /v1/blocks/BLOCK_DOES_NOT_EXIST/children
        Http::fake([
            'https://api.notion.com/v1/blocks/b55c9c91-384d-452b-81db-d1ef79372b11*' => Http::response(
                json_decode(file_get_contents('tests/stubs/endpoints/blocks/response_specific_404.json'), true),
                200,
                ['Headers']
            ),
        ]);

        $this->expectException(NotionException::class);
        $this->expectExceptionMessage('Not found');
        $this->expectExceptionCode(404);

        Notion::block('b55c9c91-384d-452b-81db-d1ef79372b11')->children();
    }

    /** @test */
    public function it_returns_parent_block_in_which_new_blocks_have_been_successfully_appended()
    {
        //TODO: Change in release 0.7.0 or 0.8.0
        //!IMPORTANT: This will be changed in Notion version 2021-08-16, because a list of the newly created block children will be returned
        //!https://developers.notion.com/changelog/notion-version-2021-08-16#append-block-children-returns-a-list-of-blocks

        // successful /v1/blocks/BLOCK_DOES_EXIST/children [patch]
        Http::fake([
            'https://api.notion.com/v1/blocks/1d719dd1-563b-4387-b74f-20da92b827fb/children*' => Http::response(
                json_decode(file_get_contents('tests/stubs/endpoints/blocks/response_specific_block_200.json'), true),
                200,
                ['Headers']
            ),
        ]);

        $paragraph = Paragraph::create('New TextBlock');
        $bulletedListItem = BulletedListItem::create('New TextBlock');
        $headingOne = HeadingOne::create('New TextBlock');
        $headingTwo = HeadingTwo::create('New TextBlock');
        $headingThree = HeadingThree::create('New TextBlock');
        $numberedListItem = NumberedListItem::create('New TextBlock');
        $toDo = ToDo::create('New TextBlock');
        $toggle = Toggle::create(['New TextBlock']);
        $embed = Embed::create('https://5amco.de', 'Testcaption');
        $image = Image::create('https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb', 'Testcaption');
        $file = File::create('https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb', 'Testcaption');
        $video = Video::create('https://www.w3schools.com/html/mov_bbb.mp4', 'TestCaption');
        $pdf = Pdf::create('https://notion.so/testpdf.pdf', 'TestCaption');

        $parentBlock = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->append($paragraph);
        $this->assertInstanceOf(Block::class, $parentBlock);

        $parentBlock = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->append($bulletedListItem);
        $this->assertInstanceOf(Block::class, $parentBlock);

        $parentBlock = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->append($headingOne);
        $this->assertInstanceOf(Block::class, $parentBlock);

        $parentBlock = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->append($headingTwo);
        $this->assertInstanceOf(Block::class, $parentBlock);

        $parentBlock = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->append($headingThree);
        $this->assertInstanceOf(Block::class, $parentBlock);

        $parentBlock = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->append($numberedListItem);
        $this->assertInstanceOf(Block::class, $parentBlock);

        $parentBlock = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->append($toDo);
        $this->assertInstanceOf(Block::class, $parentBlock);

        $parentBlock = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->append($toggle);
        $this->assertInstanceOf(Block::class, $parentBlock);

        $parentBlock = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->append($embed);
        $this->assertInstanceOf(Block::class, $parentBlock);

        $parentBlock = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->append($image);
        $this->assertInstanceOf(Block::class, $parentBlock);

        $parentBlock = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->append($file);
        $this->assertInstanceOf(Block::class, $parentBlock);

        $parentBlock = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->append($video);
        $this->assertInstanceOf(Block::class, $parentBlock);

        $parentBlock = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->append($pdf);
        $this->assertInstanceOf(Block::class, $parentBlock);

        $parentBlock = Notion::block('1d719dd1-563b-4387-b74f-20da92b827fb')->append([$paragraph, $bulletedListItem, $headingOne, $headingTwo, $headingThree, $numberedListItem, $toDo, $toggle, $embed, $image, $video, $pdf]);
        $this->assertInstanceOf(Block::class, $parentBlock);
    }

    /**
     * @dataProvider classProvider
     */
    public function classProvider(): array
    {
        return [
            [BulletedListItem::class],
            [HeadingOne::class],
            [HeadingTwo::class],
            [HeadingThree::class],
            [NumberedListItem::class],
            [Paragraph::class],
            [ToDo::class],
            [Toggle::class],
        ];
    }

    /**
     * @test
     *
     * @dataProvider classProvider
     *
     * @param $entityClass
     */
    public function it_throws_an_handling_exception_for_wrong_type($entityClass)
    {
        $this->expectException(HandlingException::class);
        $paragraph = $entityClass::create(new \stdClass());
    }

    /** @test */
    public function it_retrieves_a_single_block()
    {
        // successful /v1/blocks/BLOCK_DOES_EXIST
        Http::fake([
            'https://api.notion.com/v1/blocks/a6f8ebe8d5df4ffab543bcd54d1c3bad' => Http::response(
                json_decode(file_get_contents('tests/stubs/endpoints/blocks/response_specific_block_200.json'), true),
                200,
                ['Headers']
            ),
        ]);

        $block = \Notion::block('a6f8ebe8d5df4ffab543bcd54d1c3bad')->retrieve();

        $this->assertInstanceOf(Block::class, $block);
        $this->assertInstanceOf(Paragraph::class, $block);
        $this->assertEquals('a6f8ebe8-d5df-4ffa-b543-bcd54d1c3bad', $block->getId());
        $this->assertEquals('paragraph', $block->getType());
        $this->assertEquals('This is a paragraph test', $block->getContent()->getPlainText());
        $this->assertEquals('block', $block->getObjectType());

        $this->assertEquals('page_id', $block->getParentType());
        $this->assertEquals('f2939732-f694-4ce2-b613-f28db6ded673', $block->getParentId());
        $this->assertTrue($block->isArchived());
    }
}
