use serde::{Serialize, Deserialize};
// Input DTO for creating a new chat history record
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateChatHistoryDto {
    pub chatbot_id: String,
    pub session_id: String,
    pub from_user: bool,
    pub message: String,
}

// Output DTO for sending chat history data 
#[derive(Debug, Serialize, Deserialize)]
pub struct ChatHistoryDto {
    pub id: String,
    pub chatbot_id: String, 
    pub session_id: String,
    pub from_user: bool,
    pub message: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,  
}

// Filter DTO for querying chat history
#[derive(Debug, Serialize, Deserialize)]
pub struct ChatHistoryFilter {
    pub chatbot_id: Option<String>,
    pub session_id: Option<String>,
    pub from_user: Option<bool>,
    pub start_date: Option<chrono::DateTime<chrono::Utc>>,
    pub end_date: Option<chrono::DateTime<chrono::Utc>>,
}