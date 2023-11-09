pub mod models;
pub mod controllers;
pub mod schema;

use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use dotenv::dotenv;
use std::env;

type DbPool = r2d2::Pool<ConnectionManager<MysqlConnection>>;

#[get("/")]
async fn index(pool: web::Data<DbPool>) -> impl Responder {
    let conn = pool.get().expect("couldn't get db connection from pool");
    let result = conn.query("SELECT * FROM users").unwrap();
    HttpResponse::Ok().body(format!("{:?}", result))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let manager = ConnectionManager::<MysqlConnection>::new(database_url);
    let pool = r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create pool");

    HttpServer::new(move || {
        App::new()
            .data(pool.clone())
            .service(index)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}