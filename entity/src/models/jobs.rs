
struct Job {
    id: String,
    queue: Option<String>,
    payload: Option<String>,
    attempts: Option<i32>,
    reserved_at: Option<i32>,
    available_at: Option<i32>,
    created_at: Option<i32>,
}