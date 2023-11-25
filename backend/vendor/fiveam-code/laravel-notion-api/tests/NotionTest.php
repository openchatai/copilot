<?php

namespace FiveamCode\LaravelNotionApi\Tests;

use FiveamCode\LaravelNotionApi\Exceptions\HandlingException;
use FiveamCode\LaravelNotionApi\Notion;

class NotionTest extends NotionApiTest
{
    /** @test */
    public function it_returns_notion_instance_with_set_token_and_connection()
    {
        $notion = new Notion('secret_*');

        $this->assertInstanceOf(Notion::class, $notion);
        $this->assertNotEmpty($notion->getConnection());
    }

    /** @test */
    public function it_throws_a_handling_exception_invalid_version()
    {
        $this->expectException(HandlingException::class);
        $this->expectExceptionMessage('Invalid version for Notion-API endpoint');

        new Notion('secret_*', 'v-does-not-exist');
    }
}
