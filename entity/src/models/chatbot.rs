use serde::{Deserialize, Serialize};
#[derive(Deserialize, Serialize)]
pub struct Chatbot {
    pub id: String,
    pub name: String,
    pub token: String,
    pub website: Option<String>,
    pub status: Option<String>,
    pub prompt_message: Option<String>,
    pub enhanced_privacy: Option<i32>,
    pub smart_sync: Option<i32>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
    pub swagger_url: Option<String>,
    pub is_premade_demo_template: Option<i32>,
}
