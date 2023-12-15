from langchain.schema import HumanMessage, SystemMessage, BaseMessage
from custom_types.api_operation import ApiOperation_vs
from custom_types.bot_message import parse_bot_message, BotMessage
from opencopilot_types.workflow_type import WorkflowFlowType

# push it to the library
from integrations.custom_prompts.prompt_loader import load_prompts
from utils.get_chat_model import get_chat_model
from langchain.schema import OutputParserException
from utils.chat_models import CHAT_MODELS
from utils.get_logger import CustomLogger
from typing import Optional, List, cast
from json import dumps

logger = CustomLogger(module_name=__name__)
chat = get_chat_model()


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
    base_prompt: str,
):
    logger.info(
        "planner data",
        context=context,
        api_summaries=api_summaries,
        prev_conversations=prev_conversations,
        flows=flows,
    )
    if not session_id:
        raise ValueError("Session id must be defined for chat conversations")
    messages: List[BaseMessage] = []
    messages.append(SystemMessage(content=base_prompt))

    messages.append(
        SystemMessage(
            content="You will have access to a list of api's and some useful information, called context."
        )
    )

    if len(prev_conversations) > 0:
        messages.extend(prev_conversations)

    if context and len(api_summaries) > 0 and len(flows) > 0:
        messages.append(
            HumanMessage(
                content=f"Here is some relevant context I found that might be helpful - ```{dumps(context, ensure_ascii=False, separators=(',', ':'))}```. Also, here is the excerpt from API swagger for the APIs I think might be helpful in answering the question ```{dumps(api_summaries)}```. I also found some api flows, that maybe able to answer the following question ```{dumps(flows, ensure_ascii=False, separators=(',', ':'))}```. If one of the flows can accurately answer the question, then set `id` in the response should be the ids defined in the flows. Flows should take precedence over the api_summaries"
            )
        )

    elif context and len(api_summaries) > 0:
        messages.append(
            HumanMessage(
                content=f"Here is some relevant context I found that might be helpful - ```{dumps(context, ensure_ascii=False, separators=(',', ':'))}```. Also, here is the excerpt from API swagger for the APIs I think might be helpful in answering the question ```{dumps(api_summaries, ensure_ascii=False, separators=(',', ':'))}```. "
            )
        )
    elif context:
        messages.append(
            HumanMessage(
                content=f"I found some relevant context that might be helpful. Here is the context: ```{dumps(context, ensure_ascii=False, separators=(',', ':'))}```. "
            )
        )
    elif len(api_summaries) > 0:
        messages.append(
            HumanMessage(
                content=f"I found API summaries that might be helpful in answering the question. Here are the api summaries: ```{dumps(api_summaries, ensure_ascii=False, separators=(',', ':'))}```. "
            )
        )
    else:
        pass

    messages.append(
        HumanMessage(
            content="""Based on the information provided to you and the conversation history of this conversation, I want you to answer the questions that follow. You should respond with a json that looks like the following, you must always use the operationIds provided in api summaries. Do not make up an operation id -
{
    "ids": ["list", "of", "operationIds", "for", "apis", "to", "be", "called"],
    "bot_message": "your response based on the instructions provided at the beginning, this could also be clarification if the information provided by the user is not complete / accurate",  
}

Don't add operation ids if you can reply by merely looking in the conversation history, also don't add any commentary.
"""
        )
    )
    messages.append(
        HumanMessage(content="If you are unsure / confused, ask claryfying questions")
    )

    messages.append(HumanMessage(content=user_requirement))

    logger.info("messages array", messages=messages)

    content = cast(str, chat(messages=messages).content)

    try:
        d = parse_bot_message(content)
        logger.info(
            "Extracting JSON payload",
            action="parse_bot_message",
            data=d,
            content=content,
        )
        return d

    except OutputParserException as e:
        logger.warn("Failed to parse json", data=content, err=str(e))
        return BotMessage(bot_message=content, ids=[])
    except Exception as e:
        logger.warn("unexpected error occured", err=str(e))
        return BotMessage(ids=[], bot_message=str(e))
