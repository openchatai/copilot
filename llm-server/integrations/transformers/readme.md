# Transformers

This folder contains mapping configurations for extracting JSON properties from API responses.

## Structure

The transformers are organized into subfolders by `app_name`. This separates the configuration for each application or service.

For example:

```
transformers/
  slack/
  twitter/
  github/
```

Inside each `app_name` folder is an `operations` subfolder. This contains one file per operation defined in the API swagger/OpenAPI spec. 

For example:

```
transformers/
  slack/
    operations/
      users_list.py
      users_info.py
      channels_list.py
```

## File format

Each operation file (e.g. `users_list.py`) contains a JSON structure that maps API response properties.

For example:

```json
{
  "users": "$.members[*].id"
}
```
This maps the `users` property to extract IDs from the `members` list in the response.

## Usage

The transformers can be loaded dynamically based on the `app_name`, `operationId`, and `method` to extract response properties.

For example:

```python
config = load_config("slack", "users_list")
```

This would load the config from `transformers/slack/operations/users_list.py`.

The config can then be used to parse the API response.


## Full Example
[run_openapi_ops.py](routes/workflow/utils/run_openapi_ops.py)
```py
from integrations.transformers.transformer import transform_response
from routes.workflow.extractors.transform_api_response 

api_response = make_api_request(headers=headers, **api_payload.__dict__)

# if a custom transformer function is defined for this operationId use that, otherwise forward it to the llm
# so we don't necessarily have to defined mappers for all api endpoints
partial_json = load_json_config(app, operation_id)
if not partial_json:
    transformed_response = transform_api_response_from_schema(
        api_payload.endpoint or "", api_response.text
    )
else:
    api_json = json.loads(api_response.text)
    transformed_response = json.dumps(
        transform_response(
            full_json=api_json, partial_json=partial_json
        )
    )

```