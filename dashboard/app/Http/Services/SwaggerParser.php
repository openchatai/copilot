<?php

namespace App\Http\Services;

use Exception;

class SwaggerParser
{
    const NONE = 'none';
    const API_KEY = 'apiKey';
    const HTTP = 'http';
    const OAUTH2 = 'oauth2';

    private $swaggerData;

    public function __construct($content)
    {
        $this->parseSwaggerFile($content);
    }

    private function parseSwaggerFile($content)
    {
        $this->swaggerData = $content;

        if ($this->swaggerData === null) {
            throw new Exception("Failed to parse Swagger file");
        }
    }

    public function getVersion()
    {
        return $this->swaggerData['openapi'] ?? null;
    }

    public function getTitle()
    {
        return $this->swaggerData['info']['title'] ?? null;
    }

    public function getDescription()
    {
        return $this->swaggerData['info']['description'] ?? null;
    }

    // Add more methods here to extract other relevant information from the Swagger data

    public function getSwaggerData()
    {
        return $this->swaggerData;
    }

    public function getEndpoints(): array
    {
        $endpoints = [];

        if (!isset($this->swaggerData['paths'])) {
            return $endpoints;
        }

        foreach ($this->swaggerData['paths'] as $path => $pathData) {
            foreach ($pathData as $method => $methodData) {
                $operationId = $methodData['operationId'] ?? null;
                $type = strtoupper($method);
                $name = $methodData['summary'] ?? null;
                $description = $methodData['description'] ?? null;
                $requestBody = $methodData['requestBody'] ?? null;
                $requestParameters = $methodData['parameters'] ?? null;
                $response = $methodData['responses'] ?? null;

                // Add more properties extraction here based on your needs

                $endpoint = new Endpoint($operationId, $type, $name, $description, $requestBody, $requestParameters, $response, $path);
                $endpoints[] = $endpoint;
            }
        }

        return $endpoints;
    }

    /**
     * @param Endpoint[] $endpoints
     */
    public function getEndpointsWithoutOperationId(array $endpoints): array
    {
        return array_filter($endpoints, function ($endpoint) {
            return empty($endpoint->operationId);
        });
    }

    /**
     * @param Endpoint[] $endpoints
     */
    public function getEndpointsWithoutDescription(array $endpoints): array
    {
        return array_filter($endpoints, function ($endpoint) {
            return empty($endpoint->description);
        });
    }

    /**
     * @param Endpoint[] $endpoints
     */
    public function getEndpointsWithoutName(array $endpoints): array
    {
        return array_filter($endpoints, function ($endpoint) {
            return empty($endpoint->name);
        });
    }

    /**
     * @param Endpoint[] $endpoints
     */
    public function getPostEndpointsWithoutRequestBody(array $endpoints): array
    {
        return array_filter($endpoints, function ($endpoint) {
            return $endpoint->type === 'POST' && empty($endpoint->requestBody);
        });
    }

    public function getAuthorizationType()
    {
        if (isset($this->swaggerData['components']['securitySchemes'])) {
            foreach ($this->swaggerData['components']['securitySchemes'] as $name => $securityScheme) {
                if (isset($securityScheme['type'])) {
                    // Check if the type is a valid authorization type
                    if (in_array($securityScheme['type'], [self::NONE, self::API_KEY, self::HTTP, self::OAUTH2])) {
                        return $securityScheme['type'];
                    }
                }
            }
        }

        return null; // Return null if no valid authorization type is found
    }
}
