import json
from typing import Optional, Tuple
from flask_socketio import emit

from werkzeug.datastructures import Headers
from entities.flow_entity import FlowDTO
from extractors.convert_json_to_text import (
    convert_json_error_to_text,
    convert_json_to_text,
)
from integrations.load_json_config import load_json_config
from integrations.transformers.transformer import transform_response
from routes.flow.api_info import ApiInfo
from routes.flow.generate_openapi_payload import generate_api_payload
from utils.get_logger import SilentException
from utils.make_api_call import make_api_request
from utils.process_app_state import process_state


async def run_actions(
    flow: FlowDTO,
    text: str,
    headers: Headers,
    app: Optional[str],
    bot_id: str,
    session_id: str,
    is_streaming: bool,
) -> Tuple[str, dict]:
    api_request_data = {}
    prev_api_response = ""
    apis_calls_history = {}
    current_state = process_state(app, headers)
    api_payload: Optional[ApiInfo] = None
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

                api_response = await make_api_request(
                    headers=headers, extra_params={}, **api_payload.__dict__
                )

                """ 
                if a custom transformer function is defined for this operationId use that, otherwise forward it to the llm,
                so we don't necessarily have to defined mappers for all api endpoints
                """

                partial_json = load_json_config(app, operation_id)
                if not partial_json:
                    apis_calls_history[operation_id] = api_response["response"]
                else:
                    api_json = json.loads(api_response["response"])
                    apis_calls_history[operation_id] = json.dumps(
                        transform_response(
                            full_json=api_json, partial_json=partial_json
                        )
                    )

            except Exception as e:
                SilentException.capture_exception(e)

                formatted_error = convert_json_error_to_text(
                    str(e), is_streaming, session_id
                )
                return str(formatted_error), api_request_data

    try:
        readable_response = convert_json_to_text(
            text,
            apis_calls_history,
            api_request_data,
            bot_id=bot_id,
            session_id=session_id,
            is_streaming=is_streaming,
        )

        return readable_response, api_request_data
    except Exception as e:
        error_message = (
            f"{str(e)}: {api_payload.endpoint}" if api_payload is not None else ""
        )
        SilentException.capture_exception(e)
        emit(session_id, error_message) if is_streaming else None
        return error_message, api_request_data
