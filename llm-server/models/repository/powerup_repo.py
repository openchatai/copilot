from typing import List
from shared.models.opencopilot_db.powerups import PowerUp
from sqlalchemy import select
from models.repository.utils import session_manager
from sqlalchemy.ext.asyncio import AsyncSession


class PowerUpRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_powerups_bulk(
        self, powerup_data_list: List[dict]
    ) -> List[PowerUp]:
        powerup_objects = [PowerUp(**data) for data in powerup_data_list]
        async with session_manager(self.session) as session:
            for powerup in powerup_objects:
                session.add(powerup)
            await session.commit()
            return powerup_objects

    async def create_powerup(self, powerup_data: dict) -> PowerUp:
        powerup = PowerUp(**powerup_data)
        async with session_manager(self.session) as session:
            session.add(powerup)
            await session.commit()
            return powerup

    async def get_powerup_by_id(self, powerup_id: int) -> PowerUp:
        async with session_manager(self.session) as session:
            return (
                await session.scalars(select(PowerUp).where(PowerUp.id == powerup_id))
            ).first()

    async def get_all_powerups(self, path: str):
        async with session_manager(self.session) as session:
            query = select(PowerUp)
            if path:
                query = query.where(
                    (PowerUp.conditional == False) | (PowerUp.path == path)
                )
            return (await session.scalars(query)).all()

    async def update_powerup(self, powerup_id: int, powerup_data: dict) -> PowerUp:
        async with session_manager(self.session) as session:
            powerup = (
                await session.scalars(select(PowerUp).where(PowerUp.id == powerup_id))
            ).first()

            if powerup:
                for key, value in powerup_data.items():
                    setattr(powerup, key, value)
                await session.commit()
            return powerup

    async def delete_powerup(self, powerup_id: int) -> bool:
        async with session_manager(self.session) as session:
            powerup = (
                await session.scalars(select(PowerUp).where(PowerUp.id == powerup_id))
            ).first()

            if powerup:
                await session.delete(powerup)
                await session.commit()
                return True
            return False
