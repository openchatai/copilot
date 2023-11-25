<?php

namespace FiveamCode\LaravelNotionApi\Tests;

use FiveamCode\LaravelNotionApi\Entities\Collections\UserCollection;
use FiveamCode\LaravelNotionApi\Entities\User;
use FiveamCode\LaravelNotionApi\Exceptions\NotionException;
use Illuminate\Support\Facades\Http;
use Notion;

/**
 * Class EndpointUsersTest.
 *
 * The fake API responses are based on Notions documentation.
 *
 * @see https://developers.notion.com/reference/get-users
 */
class EndpointUsersTest extends NotionApiTest
{
    /** @test */
    public function it_throws_a_notion_exception_bad_request()
    {
        // failing /v1/users
        Http::fake([
            'https://api.notion.com/v1/users?*' => Http::response(
                json_decode('{}', true),
                400,
                ['Headers']
            ),
        ]);

        $this->expectException(NotionException::class);
        $this->expectExceptionMessage('Bad Request');
        $this->expectExceptionCode(400);

        Notion::users()->all();
    }

    /** @test */
    public function it_returns_all_users_of_workspace_as_collection_with_entity_objects()
    {
        // successful /v1/users
        Http::fake([
            'https://api.notion.com/v1/users?*' => Http::response(
                json_decode(file_get_contents('tests/stubs/endpoints/users/response_all_200.json'), true),
                200,
                ['Headers']
            ),
        ]);

        $users = Notion::users()->all();

        $this->assertInstanceOf(UserCollection::class, $users);

        $userCollection = $users->asCollection();
        $this->assertContainsOnly(User::class, $userCollection);
        $this->assertIsIterable($userCollection);
        $this->assertCount(2, $userCollection);

        $user = $userCollection->first();

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('Avocado Lovelace', $user->getName());
        $this->assertEquals('https://secure.notion-static.com/e6a352a8-8381-44d0-a1dc-9ed80e62b53d.jpg', $user->getAvatarUrl());
    }

    /** @test */
    public function it_returns_a_specific_user_as_entity_object()
    {
        // successful /v1/users/USER_DOES_EXITS
        Http::fake([
            'https://api.notion.com/v1/users/d40e767c-d7af-4b18-a86d-55c61f1e39a4' => Http::response(
                json_decode(file_get_contents('tests/stubs/endpoints/users/response_specific_200.json'), true),
                200,
                ['Headers']
            ),
        ]);

        $user = Notion::users()->find('d40e767c-d7af-4b18-a86d-55c61f1e39a4');

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('Avocado Lovelace', $user->getName());
        $this->assertEquals('user', $user->getObjectType());
        $this->assertEquals('https://secure.notion-static.com/e6a352a8-8381-44d0-a1dc-9ed80e62b53d.jpg', $user->getAvatarUrl());
    }

    /** @test */
    public function it_throws_a_notion_exception_not_found()
    {
        // failing /v1/pages/PAGE_DOES_NOT_EXIST
        Http::fake([
            'https://api.notion.com/v1/users/d40e767c-d7af-4b18-a86d-55c61f1e39a1' => Http::response(
                json_decode(file_get_contents('tests/stubs/endpoints/users/response_specific_404.json'), true),
                200,
                ['Headers']
            ),
        ]);

        $this->expectException(NotionException::class);
        $this->expectExceptionMessage('Not found');
        $this->expectExceptionCode(404);

        Notion::users()->find('d40e767c-d7af-4b18-a86d-55c61f1e39a1');
    }
}
