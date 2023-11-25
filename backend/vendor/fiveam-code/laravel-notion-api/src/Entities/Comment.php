<?php

namespace FiveamCode\LaravelNotionApi\Entities;

use FiveamCode\LaravelNotionApi\Entities\PropertyItems\RichText;
use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use FiveamCode\LaravelNotionApi\Traits\HasParent;
use FiveamCode\LaravelNotionApi\Traits\HasTimestamps;
use Illuminate\Support\Arr;

/**
 * Class Comment.
 */
class Comment extends Entity
{
    use HasTimestamps, HasParent;

    /**
     * @var string
     */
    private string $discussionId;

    /**
     * @var RichText
     */
    private RichText $richText;

    public function __construct(?array $rawResponse = null)
    {
        if ($rawResponse !== null) {
            $this->setResponseData($rawResponse);
        }
    }

    public static function fromText($content): Comment
    {
        $commentEntity = new Comment();

        if (is_string($content)) {
            $richText = new RichText();
            $richText->setPlainText($content);
            $commentEntity->richText = $richText;
        } else {
            $commentEntity->richText = $content;
        }

        //!INFO: Currently only plain_text is transfered into rawContent
        //TODO: Later the RichText has to return it's raw structure into 'content'
        $commentEntity->responseData = [
            'rich_text' => [
                [
                    'type' => 'text',
                    'text' => [
                        'content' => $commentEntity->getText(),
                    ],
                ],
            ],
        ];

        return $commentEntity;
    }

    /**
     * @param  array  $responseData
     *
     * @throws HandlingException
     * @throws \FiveamCode\LaravelNotionApi\Exceptions\NotionException
     */
    protected function setResponseData(array $responseData): void
    {
        parent::setResponseData($responseData);
        if ($responseData['object'] !== 'comment') {
            throw HandlingException::instance('invalid json-array: the given object is not a comment');
        }
        $this->fillFromRaw();
    }

    private function fillFromRaw(): void
    {
        parent::fillEssentials();
        $this->fillRichText();
        $this->fillDiscussionId();
    }

    private function fillDiscussionId(): void
    {
        if (Arr::exists($this->responseData, 'discussion_id') && $this->responseData['discussion_id'] !== null) {
            $this->discussionId = $this->responseData['discussion_id'];
        }
    }

    private function fillRichText(): void
    {
        if (Arr::exists($this->responseData, 'rich_text') && $this->responseData['rich_text'] !== null) {
            $this->richText = new RichText($this->responseData['rich_text']);
        }
    }

    /**
     * @return string
     */
    public function getDiscussionId(): string
    {
        return $this->discussionId;
    }

    /**
     * @return RichText
     */
    public function getRichText(): RichText
    {
        return $this->richText;
    }

    /**
     * @return string
     */
    public function getText(): string
    {
        return $this->getRichText()->getPlainText();
    }
}
