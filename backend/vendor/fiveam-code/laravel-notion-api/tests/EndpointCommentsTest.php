<?php

use Carbon\Carbon;
use FiveamCode\LaravelNotionApi\Entities\Collections\CommentCollection;
use FiveamCode\LaravelNotionApi\Entities\Comment;
use FiveamCode\LaravelNotionApi\Entities\PropertyItems\RichText;
use FiveamCode\LaravelNotionApi\Exceptions\NotionException;
use Illuminate\Support\Facades\Http;

it('should throw correct exception if comment access not allowed by api when listing comments', function () {
    // not_found /v1/comments
    Http::fake([
        'https://api.notion.com/v1/comments?block_id=cbf6b0af-6eaa-45ca-9715-9fa147ef6b17*' => Http::response(
            json_decode(file_get_contents('tests/stubs/endpoints/comments/response_list_comments_403.json'), true),
            403,
            ['Headers']
        ),
    ]);

    $this->expectException(NotionException::class);
    $this->expectExceptionMessage('Insufficient permissions for this endpoint.');
    $this->expectExceptionCode(403);

    \Notion::comments()->ofBlock('cbf6b0af-6eaa-45ca-9715-9fa147ef6b17')->list();
});

it('should throw correct exception if block_id has not been found when listing comments', function () {
    // not_found /v1/comments
    Http::fake([
        'https://api.notion.com/v1/comments?block_id=cbf6b0af-6eaa-45ca-9715-9fa147ef6b17*' => Http::response(
            json_decode(file_get_contents('tests/stubs/endpoints/comments/response_list_comments_404.json'), true),
            404,
            ['Headers']
        ),
    ]);

    $this->expectException(NotionException::class);
    $this->expectExceptionMessage('Not Found');
    $this->expectExceptionCode(404);

    \Notion::comments()->ofBlock('cbf6b0af-6eaa-45ca-9715-9fa147ef6b17')->list();
});

it('should fetch list of comments with an accurate representation of attributes', function () {
    // successfull /v1/comments
    Http::fake([
        'https://api.notion.com/v1/comments?block_id=abf6b0af-6eaa-45ca-9715-9fa147ef6b17*' => Http::response(
            json_decode(file_get_contents('tests/stubs/endpoints/comments/response_list_comments_200.json'), true),
            200,
            ['Headers']
        ),
    ]);

    $commentCollection = \Notion::comments()->ofBlock('abf6b0af-6eaa-45ca-9715-9fa147ef6b17');

    $collection = $commentCollection->asCollection();
    $json = $commentCollection->asJson();

    expect($commentCollection)->toBeInstanceOf(CommentCollection::class);
    expect($collection)->toBeInstanceOf(\Illuminate\Support\Collection::class);
    expect($json)->toBeString();

    expect($collection->count())->toBe(1);
    expect($collection->first())->toBeInstanceOf(Comment::class);
    expect($collection->first()->getObjectType())->toBe('comment');
    expect($collection->first()->getId())->toBe('94cc56ab-9f02-409d-9f99-1037e9fe502f');
    expect($collection->first()->getCreatedTime())->toEqual(Carbon::parse('2022-07-15T16:52:00.000Z')->toDateTime());
    expect($collection->first()->getLastEditedTime())->toEqual(Carbon::parse('2022-07-15T19:16:00.000Z')->toDateTime());
    expect($collection->first()->getCreatedBy()->getId())->toBe('9b15170a-9941-4297-8ee6-83fa7649a87a');
    expect($collection->first()->getLastEditedBy())->toBe(null);
    expect($collection->first()->getText())->toBe('Single comment');
    expect($collection->first()->getRichText()->getPlainText())->toBe('Single comment');
    expect($collection->first()->getRichText())->toBeInstanceOf(RichText::class);
    expect($collection->first()->getParentId())->toBe('5c6a2821-6bb1-4a7e-b6e1-c50111515c3d');
    expect($collection->first()->getParentType())->toBe('page_id');
    expect($collection->first()->getDiscussionId())->toBe('f1407351-36f5-4c49-a13c-49f8ba11776d');

    expect($json)->toBeJson();
});

it('should throw correct exception if comment access not allowed by api when creating a comment', function () {
    // not_found /v1/comments
    Http::fake([
        'https://api.notion.com/v1/comments*' => Http::response(
            json_decode(file_get_contents('tests/stubs/endpoints/comments/response_create_comment_403.json'), true),
            403,
            ['Headers']
        ),
    ]);

    $this->expectException(NotionException::class);
    $this->expectExceptionMessage('Insufficient permissions for this endpoint.');
    $this->expectExceptionCode(403);

    \Notion::comments()->onPage('5c6a2821-6bb1-4a7e-b6e1-c50111515c3d')->create(Comment::fromText('Hello world'));
});

it('should throw correct exception if discussion is not found with discussion_id when creating a comment', function () {
    // not_found (post) /v1/comments
    Http::fake([
        'https://api.notion.com/v1/comments*' => Http::response(
            json_decode(file_get_contents('tests/stubs/endpoints/comments/response_create_comment_404.json'), true),
            404,
            ['Headers']
        ),
    ]);

    $this->expectException(NotionException::class);
    $this->expectExceptionMessage('Could not find discussion with ID: 141216d8-bbc5-4c24-9d37-3c45d3bc15cc.');
    $this->expectExceptionCode(404);

    \Notion::comments()->onDiscussion('141216d8-bbc5-4c24-9d37-3c45d3bc15cc')->create(Comment::fromText('Hello world'));
});

it('successfully creates a comment within a page', function () {
    // successfull (post) /v1/comments
    Http::fake([
        'https://api.notion.com/v1/comments*' => Http::response(
            json_decode(file_get_contents('tests/stubs/endpoints/comments/response_create_comment_200.json'), true),
            200,
            ['Headers']
        ),
    ]);

    $comment = \Notion::comments()->onPage('5c6a2821-6bb1-4a7e-b6e1-c50111515c3d')->create(Comment::fromText('Hello world'));

    expect($comment)->toBeInstanceOf(Comment::class);
    expect($comment->getObjectType())->toBe('comment');
    expect($comment->getId())->toBe('b52b8ed6-e029-4707-a671-832549c09de3');
    expect($comment->getCreatedTime())->toEqual(Carbon::parse('2022-07-15T20:53:00.000Z')->toDateTime());
    expect($comment->getLastEditedTime())->toEqual(Carbon::parse('2022-07-15T20:53:00.000Z')->toDateTime());
    expect($comment->getCreatedBy()->getId())->toBe('067dee40-6ebd-496f-b446-093c715fb5ec');
    expect($comment->getText())->toBe('Hello world');
    expect($comment->getRichText()->getPlainText())->toBe('Hello world');
    expect($comment->getRichText())->toBeInstanceOf(RichText::class);
    expect($comment->getParentId())->toBe('5c6a2821-6bb1-4a7e-b6e1-c50111515c3d');
    expect($comment->getParentType())->toBe('page_id');
    expect($comment->getDiscussionId())->toBe('f1407351-36f5-4c49-a13c-49f8ba11776d');
});
