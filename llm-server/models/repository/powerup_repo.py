from typing import List
from shared.models.opencopilot_db.powerups import PowerUp
from shared.models.opencopilot_db import async_engine
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession
from models.repository.utils import db_session
from langchain.schema import HumanMessage, SystemMessage
from langchain.pydantic_v1 import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser
from utils.llm_consts import redis_client
import urllib.parse
from utils.get_chat_model import get_chat_model

async_session = async_sessionmaker(async_engine, expire_on_commit=False)


class Result(BaseModel):
    urn: str = Field(
        description="url after replacing dynamic parameters with empty brackets"
    )


@db_session
async def create_powerups_bulk(
    session: AsyncSession, powerup_data_list: List[dict]
) -> List[PowerUp]:
    powerup_objects = [PowerUp(**data) for data in powerup_data_list]

    for powerup in powerup_objects:
        session.add(powerup)
    await session.commit()
    return powerup_objects


@db_session
async def create_powerup(session: AsyncSession, powerup_data: dict) -> PowerUp:
    powerup = PowerUp(**powerup_data)

    session.add(powerup)
    await session.commit()

    return powerup


@db_session
async def get_powerup_by_id(session: AsyncSession, powerup_id: int) -> PowerUp:
    return (
        await session.scalars(select(PowerUp).where(PowerUp.id == powerup_id))
    ).first()


@db_session
async def get_all_powerups(session: AsyncSession, path: str):
    query = select(PowerUp)
    if path:
        query = query.where((PowerUp.conditional == False) | (PowerUp.path == path))
    return (await session.scalars(query)).all()


@db_session
async def update_powerup(
    session: AsyncSession, powerup_id: int, powerup_data: dict
) -> PowerUp:
    powerup = (
        await session.scalars(select(PowerUp).where(PowerUp.id == powerup_id))
    ).first()

    if powerup:
        for key, value in powerup_data.items():
            setattr(powerup, key, value)
        await session.commit()

    return powerup


@db_session
async def delete_powerup(session: AsyncSession, powerup_id: int) -> bool:
    powerup = (
        await session.scalars(select(PowerUp).where(PowerUp.id == powerup_id))
    ).first()

    if powerup:
        await session.delete(powerup)
        await session.commit()
        return True
    return False


def parse_url_result(input: str) -> Result:
    parser = PydanticOutputParser(pydantic_object=Result)
    return parser.parse(input)


async def get_cached_result(key: str) -> str:
    cached_result = await redis_client.get(key)
    return cached_result


async def cache_result(key: str, value: str, ttl: int):
    await redis_client.setex(key, ttl, value)


async def get_regex_for_dynamic_params(url: str) -> str:
    redis_key = f"url_cache:{url}"
    cached_result = await get_cached_result(redis_key)

    if cached_result:
        return cached_result

    chat_model = get_chat_model()
    messages = []
    url_parts = urllib.parse.urlparse(url)
    url_without_query = urllib.parse.urlunparse(
        (
            url_parts.scheme,
            url_parts.netloc,
            url_parts.path,
            url_parts.params,
            "",
            url_parts.fragment,
        )
    )

    system_message = SystemMessage(
        content="You are an ai assistant that can carefully analyze the given url"
    )

    messages.append(system_message)
    messages.append(
        HumanMessage(
            content="""Given a url, you need to replace the dynamic param with empty brackets. You will return a json in the following format
        {
            "urn": "string"
        }                         
    """
        )
    )

    messages.append(HumanMessage(content=f"Here is the url: {url_without_query}"))
    content = chat_model(messages).content
    result = parse_url_result(content)

    # Cache the result with a TTL of 2 hours
    await cache_result(redis_key, result.urn, ttl=7200)

    return result.urn
