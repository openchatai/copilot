from langchain.schema import HumanMessage, SystemMessage, BaseMessage
from custom_types.api_operation import ApiOperation_vs
from custom_types.bot_message import BotMessage
from opencopilot_types.workflow_type import WorkflowFlowType
from routes.workflow.extractors.extract_json import extract_json_payload

# push it to the library
from integrations.custom_prompts.prompt_loader import load_prompts
from utils import get_chat_model
from utils.chat_models import CHAT_MODELS
from utils.get_logger import struct_log
from typing import Optional, List, cast
from json import dumps

chat = get_chat_model(CHAT_MODELS.gpt_3_5_turbo_16k)


# @Remaining tasks here
# 1. Todo: add application initial state here as well
# 2. Add api data from qdrant so that the llm understands what apis are available to it for use
def process_conversation_step(
    session_id: str,
    app: Optional[str],
    user_requirement: str,
    context: Optional[str],
    api_summaries: List[ApiOperation_vs],
    prev_conversations: List[BaseMessage],
    flows: List[WorkflowFlowType],
    bot_id: str,
):
    if not session_id:
        raise ValueError("Session id must be defined for chat conversations")
    prompt_templates = load_prompts(bot_id)
    system_message_classifier = SystemMessage(
        content="You are a helpful ai assistant. User will give you two things, a list of api's and some useful information, called context."
    )
    if app and prompt_templates.system_message is not None:
        system_message_classifier = SystemMessage(
            content=prompt_templates.system_message
        )
    struct_log.info(
        event="system_message_classifier",
        app=app,
        context=context,
        classification_prompt=system_message_classifier,
        prev_conversations=prev_conversations,
    )
    messages: List[BaseMessage] = []
    messages.append(system_message_classifier)

    if len(prev_conversations) > 0:
        messages.extend(prev_conversations)

    if context and len(api_summaries) > 0 and len(flows) > 0:
        messages.append(
            HumanMessage(
                content=f"Here is some relevant context I found that might be helpful - ```{dumps(context)}```. Also, here is the excerpt from API swagger for the APIs I think might be helpful in answering the question ```{dumps(api_summaries)}```. I also found some api flows, that maybe able to answer the following question ```{dumps(flows)}```. If one of the flows can accurately answer the question, then set `id` in the response should be the ids defined in the flows. Flows should take precedence over the api_summaries"
            )
        )

    elif context and len(api_summaries) > 0:
        messages.append(
            HumanMessage(
                content=f"Here is some relevant context I found that might be helpful - ```{dumps(context)}```. Also, here is the excerpt from API swagger for the APIs I think might be helpful in answering the question ```{dumps(api_summaries)}```. "
            )
        )
    elif context:
        messages.append(
            HumanMessage(
                content=f"I found some relevant context that might be helpful. Here is the context: ```{dumps(context)}```. "
            )
        )
    elif len(api_summaries) > 0:
        messages.append(
            HumanMessage(
                content=f"I found API summaries that might be helpful in answering the question. Here are the api summaries: ```{dumps(api_summaries)}```. "
            )
        )
    else:
        pass

    messages.append(
        HumanMessage(
            content="""Based on the information provided to you I want you to answer the questions that follow. Your should respond with a json that looks like the following - 
    {{
        "ids": ["list", "of", "apis", "to", "be", "called"],
        "bot_message": "your response based on the instructions provided at the beginning"
    }}                
    """
        )
    )
    messages.append(
        HumanMessage(content="If you are unsure / confused, ask claryfying questions")
    )

    messages.append(HumanMessage(content=user_requirement))

    content = chat(messages=messages).content
    d = extract_json_payload(cast(str, content))

    if isinstance(d, str):
        return BotMessage(ids=[], bot_message=d)

    struct_log.info(event="extract_json_payload", data=d)

    bot_message = BotMessage.from_dict(d)
    return bot_message
