from custom_types.api_operation import ActionOperation_vs
from opencopilot_types.workflow_type import WorkflowFlowType

# push it to the library
from shared.utils.opencopilot_utils.get_vector_store import get_vector_store
from shared.utils.opencopilot_utils import StoreOptions
from utils.chat_models import CHAT_MODELS
from utils.get_chat_model import get_chat_model
from typing import Optional, List
from langchain.vectorstores.base import VectorStore
from utils.get_logger import CustomLogger
from utils.llm_consts import vs_thresholds

logger = CustomLogger(module_name=__name__)
chat = get_chat_model(CHAT_MODELS.gpt_3_5_turbo_16k)

knowledgebase: VectorStore = get_vector_store(StoreOptions("knowledgebase"))
flows: VectorStore = get_vector_store(StoreOptions("swagger"))
apis: VectorStore = get_vector_store(StoreOptions("actions"))


async def get_relevant_docs(text: str, bot_id: str) -> Optional[str]:
    try:
        kb_retriever = knowledgebase.as_retriever(
            search_kwargs={
                "k": 3,
                "score_threshold": vs_thresholds.get("kb_score_threshold"),
                "filter": {"bot_id": bot_id},
            },
        )

        result = kb_retriever.get_relevant_documents(text)

        if result and len(result) > 0:
            # Assuming result is a list of objects and each object has a page_content attribute
            all_page_content = "\n\n".join([item.page_content for item in result])

            return all_page_content

        return None

    except Exception as e:
        logger.error(
            "Error occurred while getting relevant docs",
            incident="get_relevant_docs",
            payload=text,
            error=str(e),
        )
        return None


async def get_relevant_flows(text: str, bot_id: str) -> List[WorkflowFlowType]:
    try:

        flow_retriever = flows.as_retriever(
            search_kwargs={
                "k": 3,
                "score_threshold": vs_thresholds.get("flows_score_threshold"),
                "filter": {"bot_id": bot_id},
            },
        )

        results = flow_retriever.get_relevant_documents(text)

        resp: List[WorkflowFlowType] = []
        for result in results:
            resp.append(result.metadata["operation"])

        return resp

    except Exception as e:
        logger.error(
            "Error occurred while getting relevant docs",
            incident="get_relevant_docs",
            payload=text,
            error=str(e),
        )
        return []


async def get_relevant_apis_summaries(text: str, bot_id: str) -> List[ActionOperation_vs]:
    try:
        apis_retriever = apis.as_retriever(
            search_kwargs={
                "k": 3,
                "score_threshold": vs_thresholds.get("api_score_threshold"),
                "filter": {"bot_id": bot_id},
            },
        )

        results = apis_retriever.get_relevant_documents(text)

        resp: List[ActionOperation_vs] = []
        for result in results:
            resp.append(
                ActionOperation_vs(**result.metadata)
            )

        return resp

    except Exception as e:
        logger.error(
            "Error occurred while getting relevant API summaries",
            incident="get_relevant_apis_summaries",
            payload=text,
            error=str(e),
        )
        return []
