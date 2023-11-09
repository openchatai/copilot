use diesel::{Queryable, prelude::Insertable};
use crate::schema::chatbots;
#[derive(Queryable, Insertable)]
#[diesel(table_name = chatbots)]
pub struct Chatbot {
    pub id: String,
    pub name: String,
    pub token: String,
    pub website: Option<String>,
    pub status: Option<String>,
    pub prompt_message: Option<String>,
    pub enhanced_privacy: Option<bool>,
    pub smart_sync: Option<bool>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
    pub swagger_url: Option<String>,
    pub is_premade_demo_template: Option<bool>,
}
