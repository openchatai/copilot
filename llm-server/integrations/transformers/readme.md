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
  "get": {
    "users": "$.members[*].id"
  }
}
```

This maps the `users` property to extract IDs from the `members` list in the response.

The keys represent the HTTP method (get, post, etc). The values contain the property mappings.

## Usage

The transformers can be loaded dynamically based on the `app_name`, `operationId`, and `method` to extract response properties.

For example:

```python
config = load_config("slack", "users_list", "get")
```

This would load the `get` config from `transformers/slack/operations/users_list.py`.

The config can then be used to parse the API response.