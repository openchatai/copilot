use crate::{AppState, models::chatbot_setting::ChatbotSetting, schemas::chatbot_settings::ChatbotSettingSchema};


use actix_web::{get, post, web, HttpResponse, Responder};
use serde_json::json;


#[get("/healthchecker")]
async fn health_checker_handler() -> impl Responder {
    const MESSAGE: &str = "Build Simple CRUD API with Rust, SQLX, MySQL, and Actix Web";

    HttpResponse::Ok().json(json!({"status": "success","message": MESSAGE}))
}

#[post("/chatbot_setting")]
pub async fn create_chatbot_setting_handler(
    body: web::Json<ChatbotSettingSchema>,
    data: web::Data<AppState>,
) -> HttpResponse {
    let query_result =
    sqlx::query(r#"INSERT INTO chatbot_settings (id,chatbot_id,name,value) VALUES (?, ?, ?, ?)"#)
        .bind(body.id.to_owned())
        .bind(body.chatbot_id.to_owned())
        .bind(body.name.to_owned())
        .bind(body.value.to_owned())
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
    let query_result = sqlx::query_as!(ChatbotSetting, r#"SELECT * FROM chatbot_settings WHERE id = ?"#, chatbot_id)
        .fetch_one(&data.db)
        .await;

    HttpResponse::Ok().json(query_result.unwrap())
}



pub fn config(conf: &mut web::ServiceConfig) {
    let scope = web::scope("/api")
        .service(health_checker_handler)
        .service(create_chatbot_setting_handler)
        .service(get_chatbot_setting_handler);
    conf.service(scope);
}