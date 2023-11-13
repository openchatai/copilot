use crate::controllers::chat_history_controller::__path_health_checker_handler;
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(
    paths(health_checker_handler),
    components(
        schemas()
    ),
    tags((name = "Opencopilot Entities", description = "CRUD operation on all endpoints")),
    modifiers()
)]
pub struct ApiDoc;