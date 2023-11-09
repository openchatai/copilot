use diesel::Queryable;

#[derive(Queryable)]
pub struct PdfDataSource {
    pub id: i32,
    pub chatbot_id: String,
    pub files: Option<serde_json::Value>,
    pub files_info: Option<serde_json::Value>,
    pub folder_name: Option<String>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
    pub ingest_status: Option<String>,
}
