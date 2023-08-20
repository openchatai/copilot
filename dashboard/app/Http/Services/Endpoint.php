<?php

namespace App\Http\Services;

class Endpoint
{
    public $operationId;
    public $type;
    public $name;
    public $description;
    public $requestBody;
    public $requestParameters;
    public $responseBody;

    public $path;

    // Add more properties here based on your needs

    public function __construct($operationId, $type, $name, $description, $requestBody, $requestParameters, $responseBody, $path)
    {
        $this->operationId = $operationId;
        $this->type = $type;
        $this->name = $name;
        $this->description = $description;
        $this->requestBody = $requestBody;
        $this->requestParameters = $requestParameters;
        $this->responseBody = $responseBody;
        $this->path = $path;
    }
}
