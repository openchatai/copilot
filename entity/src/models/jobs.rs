use diesel::{Queryable, prelude::Insertable};
use crate::schema::jobs;
#[derive(Queryable, Insertable)]
#[table_name=jobs]
pub struct Job {
  pub id: u64,
  pub queue: String,
  pub payload: String,
  pub attempts: u8,
  pub reserved_at: Option<u32>,
  pub available_at: u32,  
  pub created_at: u32,
}