from typing import List
from shared.models.opencopilot_db.powerups import PowerUp
from shared.models.opencopilot_db import engine
from utils.get_chat_model import get_chat_model
from sqlalchemy.orm import sessionmaker
import urllib.parse
from langchain.schema import HumanMessage, SystemMessage
from langchain.pydantic_v1 import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser
from utils.llm_consts import redis_client

SessionLocal = sessionmaker(bind=engine)


def create_powerups_bulk(powerup_data_list: List[dict]) -> List[PowerUp]:
    with SessionLocal() as session:
        powerup_objects = [PowerUp(**data) for data in powerup_data_list]
        session.bulk_save_objects(powerup_objects)
        session.commit()
        return powerup_objects


def create_powerup(powerup_data: dict) -> PowerUp:
    with SessionLocal() as session:
        powerup = PowerUp(**powerup_data)
        session.add(powerup)
        session.commit()
        session.refresh(powerup)
        return powerup


def get_powerup_by_id(powerup_id: int) -> PowerUp:
    with SessionLocal() as session:
        return session.query(PowerUp).filter(PowerUp.id == powerup_id).first()


def get_all_powerups(path: str) -> List[PowerUp]:
    with SessionLocal() as session:
        query = session.query(PowerUp)
        if path:
            query = query.filter(
                (PowerUp.conditional == False) | (PowerUp.path == path)
            )
        return query.all()


def update_powerup(powerup_id: int, powerup_data: dict) -> PowerUp:
    with SessionLocal() as session:
        powerup = session.query(PowerUp).filter(PowerUp.id == powerup_id).first()
        if powerup:
            for key, value in powerup_data.items():
                setattr(powerup, key, value)
            session.commit()
            session.refresh(powerup)
        return powerup


def delete_powerup(powerup_id: int) -> bool:
    with SessionLocal() as session:
        powerup = session.query(PowerUp).filter(PowerUp.id == powerup_id).first()
        if powerup:
            session.delete(powerup)
            session.commit()
            return True
        return False


class Result(BaseModel):
    urn: str = Field(
        description="url after replacing dynamic parameters with empty brackets"
    )


def parse_url_result(input: str) -> Result:
    parser = PydanticOutputParser(pydantic_object=Result)
    return parser.parse(input)


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


async def cache_result(key: str, value: str, ttl: int):
    await redis_client.setex(key, ttl, value)


async def get_cached_result(key: str) -> str:
    cached_result = await redis_client.get(key)
    return cached_result
