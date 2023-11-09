use diesel::Queryable;

#[derive(Queryable)]
pub struct Job {
    pub id: u64,
    pub queue: String,
    pub payload: String,
    pub attempts: u8,
    pub reserved_at: Option<u32>,
    pub available_at: u32,
    pub created_at: u32,
}