use chrono::NaiveDateTime;
use serde::{Serialize, Deserialize};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct CreateChatbotSetting {
    pub id: String,
    pub chatbot_id: String,
    pub name: String,
    pub value: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}
