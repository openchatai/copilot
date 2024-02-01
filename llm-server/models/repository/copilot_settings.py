from sqlalchemy.orm import sessionmaker

from shared.models.opencopilot_db.chatbot import ChatbotSettings, engine
from utils.get_logger import CustomLogger

# Create a Session factory
SessionLocal = sessionmaker(bind=engine)
logger = CustomLogger(module_name=__name__)


class ChatbotSettingCRUD:
    @staticmethod
    def get_chatbot_setting(id: int):
        with SessionLocal() as db:
            return db.query(ChatbotSettings).filter(ChatbotSettings.id == id).first()

    @staticmethod
    def get_chatbot_settings(skip: int = 0, limit: int = 100):
        with SessionLocal() as db:
            return db.query(ChatbotSettings).offset(skip).limit(limit).all()

    @staticmethod
    def create_chatbot_setting(max_pages_to_crawl: int, chatbot_id: str):
        with SessionLocal() as db:
            db_chatbot_setting = ChatbotSettings(
                max_pages_to_crawl=max_pages_to_crawl, chatbot_id=chatbot_id
            )
            db.add(db_chatbot_setting)
            db.commit()
            db.refresh(db_chatbot_setting)
            return db_chatbot_setting

    @staticmethod
    def update_chatbot_setting(
        chatbot_setting_id: int, max_pages_to_crawl: int = None, chatbot_id: str = None
    ):
        with SessionLocal() as db:
            chatbot_setting = (
                db.query(ChatbotSettings)
                .filter(ChatbotSettings.id == chatbot_setting_id)
                .first()
            )
            if chatbot_setting is not None:
                chatbot_setting.max_pages_to_crawl = (
                    max_pages_to_crawl or chatbot_setting.max_pages_to_crawl
                )
                chatbot_setting.chatbot_id = chatbot_id or chatbot_setting.chatbot_id
                db.commit()
                return chatbot_setting
