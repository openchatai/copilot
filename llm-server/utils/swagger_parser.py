import json


class Endpoint:
    def __init__(self, operation_id, type, name, description, request_body, request_parameters, response, path):
        self.operation_id = operation_id
        self.type = type
        self.name = name
        self.description = description
        self.request_body = request_body
        self.request_parameters = request_parameters
        self.response = response
        self.path = path


def get_post_endpoints_without_request_body(endpoints):
    return [endpoint for endpoint in endpoints if endpoint.type == 'POST' and not endpoint.request_body]


def get_endpoints_without_name(endpoints):
    return [endpoint for endpoint in endpoints if not endpoint.name]


def get_endpoints_without_description(endpoints):
    return [endpoint for endpoint in endpoints if not endpoint.description]


def get_endpoints_without_operation_id(endpoints):
    return [endpoint for endpoint in endpoints if not endpoint.operation_id]


class SwaggerParser:
    NONE = 'none'
    API_KEY = 'apiKey'
    HTTP = 'http'
    OAUTH2 = 'oauth2'

    def __init__(self, content):
        self.swagger_data = content
        if self.swagger_data is None:
            raise Exception("Failed to parse Swagger file")

    def get_version(self):
        return self.swagger_data.get('openapi')

    def get_title(self):
        return self.swagger_data.get('info', {}).get('title')

    def get_description(self):
        return self.swagger_data.get('info', {}).get('description')

    def get_swagger_data(self):
        return self.swagger_data

    def get_endpoints(self):
        endpoints = []
        paths = self.swagger_data.get('paths', {})

        for path, path_data in paths.items():
            for method, method_data in path_data.items():
                endpoint = Endpoint(
                    operation_id=method_data.get('operationId'),
                    type=method.upper(),
                    name=method_data.get('summary'),
                    description=method_data.get('description'),
                    request_body=method_data.get('requestBody'),
                    request_parameters=method_data.get('parameters'),
                    response=method_data.get('responses'),
                    path=path
                )
                endpoints.append(endpoint)

        return endpoints

    def get_authorization_type(self):
        security_schemes = self.swagger_data.get('components', {}).get('securitySchemes', {})
        for name, security_scheme in security_schemes.items():
            scheme_type = security_scheme.get('type')
            if scheme_type in [self.NONE, self.API_KEY, self.HTTP, self.OAUTH2]:
                return scheme_type
        return None
