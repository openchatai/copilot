<?php

namespace FiveamCode\LaravelNotionApi\Endpoints;

use FiveamCode\LaravelNotionApi\Entities\Collections\CommentCollection;
use FiveamCode\LaravelNotionApi\Entities\Comment as CommentEntity;
use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use FiveamCode\LaravelNotionApi\Exceptions\NotionException;
use FiveamCode\LaravelNotionApi\Notion;

/**
 * Class Comments.
 */
class Comments extends Endpoint
{
    /**
     * @var ?string
     */
    private ?string $discussionId = null;

    /**
     * @var ?string
     */
    private ?string $pageId = null;

    /**
     * Block constructor.
     *
     * @param  Notion  $notion
     * @param  string  $blockId
     *
     * @throws HandlingException
     * @throws \FiveamCode\LaravelNotionApi\Exceptions\LaravelNotionAPIException
     */
    public function __construct(Notion $notion)
    {
        parent::__construct($notion);
    }

    /**
     * Retrieve a list of comments
     * url: https://api.notion.com/{version}/comments?block_id=* [get]
     * notion-api-docs: https://developers.notion.com/reference/retrieve-a-comment.
     *
     * @param  string  $blockId
     * @return CommentCollection
     *
     * @throws HandlingException
     * @throws NotionException
     */
    public function ofBlock(string $blockId): CommentCollection
    {
        $response = $this->get(
            $this->url(Endpoint::COMMENTS."?block_id={$blockId}&{$this->buildPaginationQuery()}")
        );

        return new CommentCollection($response->json());
    }

    /**
     * @param  string  $discussionId
     * @return Comments
     */
    public function onDiscussion(string $discussionId): self
    {
        if ($this->pageId !== null) {
            throw new HandlingException('You can only use `onDiscussion()` or `onPage()`.');
        }

        $this->discussionId = $discussionId;

        return $this;
    }

    /**
     * @param  string  $pageId
     * @return Comments
     */
    public function onPage(string $pageId): self
    {
        if ($this->discussionId !== null) {
            throw new HandlingException('You can only use `onDiscussion()` or `onPage()`.');
        }

        $this->pageId = $pageId;

        return $this;
    }

    /**
     * Create a comment
     * url: https://api.notion.com/{version}/comments [post]
     * notion-api-docs: https://developers.notion.com/reference/create-a-comment.
     *
     * @param  CommentEntity  $comment
     * @return CommentEntity
     *
     * @throws HandlingException
     * @throws NotionException
     */
    public function create($comment): CommentEntity
    {
        if ($this->discussionId === null && $this->pageId === null) {
            throw new HandlingException('You must use `onDiscussion()` or `onPage()`.');
        }

        $body = $comment->getRawResponse();
        if ($this->discussionId !== null) {
            $body['discussion_id'] = $this->discussionId;
        } else {
            $body['parent'] = [
                'page_id' => $this->pageId,
            ];
        }

        $response = $this->post(
            $this->url(Endpoint::COMMENTS),
            $body
        );

        return new CommentEntity($response->json());
    }
}
