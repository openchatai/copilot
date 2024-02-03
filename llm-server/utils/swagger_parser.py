import json
from collections import defaultdict
from typing import DefaultDict, Dict, Any, cast
from typing import List
from urllib.parse import urlparse
import re

from langchain.schema import HumanMessage, SystemMessage
from langchain.text_splitter import RecursiveCharacterTextSplitter

from entities.action_entity import ActionDTO
from shared.utils.opencopilot_utils.init_vector_store import init_vector_store
from shared.utils.opencopilot_utils.interfaces import StoreOptions
from utils.get_chat_model import get_chat_model
from utils.get_logger import CustomLogger

logger = CustomLogger(__name__)


class Endpoint:
    def __init__(
        self,
        operation_id,
        endpoint_type,
        name,
        description,
        request_body,
        parameters,
        response,
        path,
    ):
        self.operation_id = operation_id
        self.type = endpoint_type
        self.name = name
        self.description = description
        self.request_body = request_body
        self.parameters = parameters
        self.response = response
        self.path = path

    def to_dict(self):
        return {
            "operation_id": self.operation_id,
            "type": self.type,
            "name": self.name,
            "description": self.description,
            "request_body": self.request_body,
            "parameters": self.parameters,
            "response": self.response,
            "path": self.path,
        }


def get_post_endpoints_without_request_body(endpoints):
    return [
        endpoint
        for endpoint in endpoints
        if endpoint.type == "POST" and not endpoint.request_body
    ]


def get_endpoints_without_name(endpoints):
    return [endpoint for endpoint in endpoints if not endpoint.name]


def get_endpoints_without_description(endpoints):
    return [endpoint for endpoint in endpoints if not endpoint.description]


def get_endpoints_without_operation_id(endpoints):
    return [endpoint for endpoint in endpoints if not endpoint.operation_id]


class SwaggerParser:
    NONE = "none"
    API_KEY = "apiKey"
    HTTP = "http"
    OAUTH2 = "oauth2"

    def __init__(self, content):
        self.swagger_data = json.loads(content)
        if self.swagger_data is None:
            raise Exception("Failed to parse Swagger file")

    def get_version(self):
        return self.swagger_data.get("openapi")

    def get_title(self):
        return self.swagger_data.get("info", {}).get("title")

    def get_description(self):
        return self.swagger_data.get("info", {}).get("description")

    def get_swagger_data(self):
        return self.swagger_data

    def get_endpoints(self) -> List[Endpoint]:
        endpoints = []
        paths = self.swagger_data.get("paths", {})

        for path, path_data in paths.items():
            for method, method_data in path_data.items():
                logger.info("method_data", method_data=method_data)
                if not method_data.get("operationId") and not method_data.get(
                    "summary"
                ):
                    logger.error(
                        "operation_id_not_found",
                        path=path,
                        method=method,
                    )

                    raise ValueError(
                        "operationId and summary not present, one of them must be present."
                    )

                endpoint = Endpoint(
                    operation_id=method_data.get("operationId"),
                    endpoint_type=method.upper(),
                    name=method_data.get(
                        method_data.get("operationId"), method_data.get("summary")
                    ),
                    description=method_data.get("description"),
                    request_body=method_data.get("requestBody"),
                    parameters=method_data.get("parameters"),
                    response=method_data.get("responses"),
                    path=path,
                )
                endpoints.append(endpoint)

        return endpoints

    def get_authorization_type(self):
        security_schemes = self.swagger_data.get("components", {}).get(
            "securitySchemes", {}
        )
        for name, security_scheme in security_schemes.items():
            scheme_type = security_scheme.get("type")
            if scheme_type in [self.NONE, self.API_KEY, self.HTTP, self.OAUTH2]:
                return scheme_type
        return None

    def get_validations(self):
        endpoints = self.get_endpoints()
        validations = {
            "endpoints_without_operation_id": [
                endpoint.to_dict()
                for endpoint in get_endpoints_without_operation_id(endpoints)
            ],
            "endpoints_without_description": [
                endpoint.to_dict()
                for endpoint in get_endpoints_without_description(endpoints)
            ],
            "endpoints_without_name": [
                endpoint.to_dict() for endpoint in get_endpoints_without_name(endpoints)
            ],
            "auth_type": self.get_authorization_type(),
        }
        return validations

    def validate_url(self, url):
        """
        Validates the given URL.
        """
        try:
            result = urlparse(url)
            # Check if scheme and netloc (host) are present
            if all([result.scheme, result.netloc]):
                return True
            else:
                return False
        except ValueError:
            return False

    def get_base_uri(self):
        """
        Retrieves the base URI from the Swagger file.
        If using OpenAPI 3.0.0, it uses the 'servers' object.
        If 'servers' is not available, it falls back to OpenAPI 2.0 properties: 'host', 'basePath', and 'schemes'.
        """
        # Try using 'servers' from OpenAPI 3.0
        servers = self.swagger_data.get("servers", [])
        if servers:
            base_url = servers[0].get("url", "")
            if self.validate_url(base_url):
                return base_url

        # Fallback to OpenAPI 2.0 properties
        host = self.swagger_data.get("host", "")
        base_path = self.swagger_data.get("basePath", "/")
        schemes = self.swagger_data.get("schemes", ["http"])

        if host:
            # Construct the base URL using host, basePath, and the first scheme
            base_url = "{}://{}{}".format(schemes[0], host, base_path)
            if self.validate_url(base_url):
                return base_url

        raise ValueError("No valid servers or host information found in Swagger data.")

    def resolve_schema_references(self, schema):
        """
        Resolves $ref references in the schema to their corresponding definitions.
        """
        if "$ref" in schema:
            ref_path = schema["$ref"]
            parts = ref_path.split("/")
            # Navigate through the swagger data to find the referenced schema
            ref_schema = self.swagger_data
            for part in parts[1:]:  # Skip the first element as it's just a '#'
                ref_schema = ref_schema.get(part, {})
            return ref_schema
        return schema

    def process_payload(self, payload):
        """
        Processes the payload to include full schema definitions for any $ref references.
        """
        if "request_body" in payload and "content" in payload["request_body"]:
            for content_type, content_data in payload["request_body"][
                "content"
            ].items():
                if "schema" in content_data:
                    content_data["schema"] = self.resolve_schema_references(
                        content_data["schema"]
                    )
        if "parameters" in payload:
            for param in payload["parameters"]:
                if "schema" in param:
                    param["schema"] = self.resolve_schema_references(param["schema"])
        return payload

    def get_all_actions(self, bot_id: str):
        """
        Retrieves all actions defined in the Swagger file as ActionDTO instances.
        Each action represents an operation on a path and includes details like base_uri,
        path, name, summary, operation_id, and other relevant information.
        """
        actions: List[ActionDTO] = []
        base_uri = self.get_base_uri()
        paths = self.swagger_data.get("paths", {})

        for path, path_data in paths.items():
            for method, method_data in path_data.items():
                payload = {
                    "request_body": method_data.get("requestBody", {}),
                    "parameters": method_data.get("parameters", []),
                }

                # Process the payload to resolve any $ref references
                processed_payload = self.process_payload(payload)

                name = method_data.get(
                    "operationId",
                    method_data.get(
                        "name",
                        method_data.get("summary", method_data.get("description")),
                    ),
                )
                if name is None:
                    logger.error(
                        "operation_id_not_found",
                        bot_id=bot_id,
                        path=path,
                        method=method,
                    )

                action_dto = ActionDTO(
                    api_endpoint=base_uri + path,
                    name=name,
                    description=method_data.get("description")
                    or method_data.get("summary"),
                    request_type=method.upper(),
                    payload=processed_payload,
                    bot_id=bot_id,
                )
                actions.append(action_dto)

        return actions

    def gather_metadata(self, api_data: dict) -> DefaultDict[str, Dict[str, str]]:
        """
        Gathers metadata such as summary, description, and tags from each API definition in the Swagger document.
        Returns the extracted metadata stored in a nested dictionary format using the combination of <host>:<http_verb><relative_path> as keys.
        """
        metadata: DefaultDict[str, Dict[str, str]] = defaultdict(dict)

        try:
            url = api_data["servers"][0]["url"]
        except IndexError:
            raise ValueError("No valid server specified.")
        except KeyError:
            raise ValueError("Missing 'servers' field or invalid schema.")

        relative_paths: DefaultDict[str, Dict[str, Any]] = defaultdict(dict)

        # @todo: the case where parameters are common for all paths is a valid way of defining apis, and we are not handling it
        # check postman collection in _swaggers folder
        for path, path_item in api_data["paths"].items():
            for http_verb, http_details in path_item.items():
                summary = http_details.get("summary", "")
                description = http_details.get("description", "")
                # inconsistent tag behaviour..
                # tags = (
                #     ", ".join([t["name"] for t in http_details.get("tags", [])])
                #     if http_details.get("tags", [])
                #     else ""
                # )
                key = f"{path}"
                relative_paths[key]["summary"] = summary
                relative_paths[key]["description"] = description
                # relative_paths[key]["tags"] = tags

        for key, value in relative_paths.items():
            metadata[url].update({key: value})

        return metadata

    def ingest_swagger_summary(self, bot_id: str) -> None:
        """
        Summarizes Swagger metadata by gathering essential information from each endpoint definition and concatenating them into one string.
        Returns the summary as a single string suitable for inputting into a large language model.
        """
        metadata = self.gather_metadata(self.swagger_data)
        response = ""

        try:
            for host, endpoints in metadata.items():
                for endpoint, meta in endpoints.items():
                    response += f"\nSummary: {meta['summary']}\nDescription: {meta['description']}"

            chat = get_chat_model()
            messages = [
                SystemMessage(
                    content="You are an assistant that can take some text and generate a correct summary of capabilities of a bot that is equipped with these api endpoints. The summary should begin with - As an ai assistant i have the following capabilities. Keep the summary concise, try to summarize in 3 sentences or less"
                ),
                HumanMessage(content=f"Summary: {response}"),
            ]

            summary = cast(str, chat(messages).content)

            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000, chunk_overlap=200, length_function=len
            )

            docs = text_splitter.create_documents([summary])
            init_vector_store(
                docs=docs,
                options=StoreOptions(
                    namespace="knowledgebase", metadata={"bot_id": bot_id}
                ),
            )

        except Exception as error:
            logger.error("swagger_parsing_failed", bot_id=bot_id, error=error)

    def remove_special_chars_and_numbers(self, text):
        # Define the pattern for special characters and digits
        # Here, we are using a pattern that matches any character that is not a letter or whitespace
        pattern = re.compile("[^a-zA-Z\s]")

        # Replace these characters with an empty string
        cleaned_text = re.sub(pattern, "", text)

        return cleaned_text
