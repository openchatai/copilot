
use diesel::{Queryable, prelude::Insertable};
use crate::schema::failed_jobs;

#[derive(Queryable, Insertable)]
#[diesel(table_name = failed_jobs)]
pub struct FailedJob {
    pub id: u64,
    pub uuid: String,
    pub connection: String,
    pub queue: String,
    pub payload: String,
    pub exception: String,
    pub failed_at: chrono::NaiveDateTime,
}
