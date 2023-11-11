use crate::{AppState, schemas::chatbot::{ChatbotCreateRequest, FilterOptions}, models::chatbot::Chatbot};


use actix_web::{delete, get, post, web, HttpResponse, Responder};
use serde_json::json;


#[get("/healthchecker")]
async fn health_checker_handler() -> impl Responder {
    const MESSAGE: &str = "Build Simple CRUD API with Rust, SQLX, MySQL, and Actix Web";

    HttpResponse::Ok().json(json!({"status": "success","message": MESSAGE}))
}

#[post("/chatbot_setting")]
pub async fn create_chatbot_setting_handler(
    body: web::Json<ChatbotCreateRequest>,
    data: web::Data<AppState>,
) -> HttpResponse {
    let query_result =
        sqlx::query(r#"INSERT INTO chatbots (name,token,website,status) VALUES (?, ?, ?, ?)"#)
            .bind(body.name.clone())
            .bind(body.token.clone())
            .bind(body.website.clone())
            .bind(body.status.clone())
            .execute(&data.db)
            .await
            .map_err(|err: sqlx::Error| err.to_string());

    if let Err(err) = query_result {
            if err.contains("Duplicate entry") {
                return HttpResponse::BadRequest().json(
                serde_json::json!({"status": "fail","message": "chatbot with that title already exists"}),
            );
        }

        return HttpResponse::InternalServerError()
            .json(serde_json::json!({"status": "error","message": format!("{:?}", err)}));
    }

    HttpResponse::Ok().finish()
}

#[get("/chatbot_setting/{id}")]
async fn get_chatbot_setting_handler(
    path: web::Path<String>,
    data: web::Data<AppState>,
) -> HttpResponse {
    let chatbot_id = path.into_inner().to_string();
    let query_result = sqlx::query_as!(Chatbot, r#"SELECT * FROM chatbots WHERE id = ?"#, chatbot_id)
        .fetch_one(&data.db)
        .await;

    HttpResponse::Ok().json(query_result.unwrap())
}



pub fn config(conf: &mut web::ServiceConfig) {
    let scope = web::scope("/api")
        .service(health_checker_handler)
        .service(create_chatbot_setting_handler)
        .service(get_chatbot_setting_handler)
    conf.service(scope);
}