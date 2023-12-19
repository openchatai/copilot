import json
from typing import Optional

from werkzeug.datastructures import Headers

from entities.flow_entity import FlowDTO
from extractors.convert_json_to_text import convert_json_to_text
from integrations.load_json_config import load_json_config
from integrations.transformers.transformer import transform_response
from routes.flow.generate_openapi_payload import generate_api_payload
from utils.get_logger import CustomLogger
from utils.make_api_call import make_api_request
from utils.process_app_state import process_state

logger = CustomLogger(module_name=__name__)


async def run_actions(
    flow: FlowDTO,
    text: str,
    headers: Headers,
    app: Optional[str],
    bot_id: str,
) -> str:
    api_request_data = {}
    prev_api_response = ""
    apis_calls_history = {}
    current_state = process_state(app, headers)

    blocks = flow.blocks

    for block in blocks:
        for action in block.actions:
            try:
                operation_id = action.operation_id

                if not operation_id:
                    continue

                api_payload = await generate_api_payload(
                    text=text,
                    action=action,
                    prev_api_response=prev_api_response,
                    app=app,
                    current_state=current_state,
                )
                api_request_data[operation_id] = api_payload.__dict__

                api_response = make_api_request(headers=headers, **api_payload.__dict__)

                logger.warn(
                    "Config map is not defined for this operationId",
                    paylooad=api_response.text,
                )

                """ 
                if a custom transformer function is defined for this operationId use that, otherwise forward it to the llm,
                so we don't necessarily have to defined mappers for all api endpoints
                """

                partial_json = load_json_config(app, operation_id)
                if not partial_json:
                    logger.warn(
                        "Config map is not defined for this operationId",
                        incident="config_map_undefined",
                        operation_id=operation_id,
                        app=app,
                    )
                    apis_calls_history[operation_id] = api_response.text

                    pass
                else:
                    logger.info(
                        "API Response",
                        incident="log_api_response",
                        api_response=api_response.text,
                        json_config_used=partial_json,
                        next_action="summarize_with_partial_json",
                    )
                    api_json = json.loads(api_response.text)
                    apis_calls_history[operation_id] = json.dumps(
                        transform_response(
                            full_json=api_json, partial_json=partial_json
                        )
                    )

            except Exception as e:
                logger.error(
                    "Error occurred during workflow check in store",
                    incident="check_workflow_in_store",
                    text=text,
                    headers=headers,
                    app=app,
                    error=str(e),
                )

                return str(e)

        # @todo : replace this with a lighter and faster model
        return convert_json_to_text(
            text, apis_calls_history, api_request_data, bot_id=bot_id
        )
