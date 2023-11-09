// @generated automatically by Diesel CLI.

diesel::table! {
    chatbot (id) {
        #[max_length = 255]
        id -> Varchar,
        #[max_length = 255]
        name -> Varchar,
        #[max_length = 255]
        token -> Varchar,
        #[max_length = 255]
        website -> Nullable<Varchar>,
        #[max_length = 255]
        status -> Nullable<Varchar>,
        #[max_length = 255]
        prompt_message -> Nullable<Varchar>,
        enhanced_privacy -> Nullable<Bool>,
        smart_sync -> Nullable<Bool>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        deleted_at -> Timestamp,
        #[max_length = 255]
        swagger_url -> Nullable<Varchar>,
        is_premade_demo_template -> Nullable<Bool>,
    }
}

diesel::table! {
    chatbot_settings (id) {
        #[max_length = 255]
        id -> Varchar,
        #[max_length = 36]
        chatbot_id -> Nullable<Char>,
        #[max_length = 255]
        name -> Nullable<Varchar>,
        #[max_length = 255]
        value -> Nullable<Varchar>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    pdf_data_source (id) {
        #[max_length = 255]
        id -> Varchar,
        #[max_length = 255]
        chatbot_id -> Nullable<Varchar>,
        files -> Nullable<Json>,
        files_info -> Nullable<Json>,
        #[max_length = 255]
        folder_name -> Nullable<Varchar>,
        created_at -> Nullable<Datetime>,
        updated_at -> Nullable<Datetime>,
        #[max_length = 255]
        ingest_status -> Nullable<Varchar>,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    chatbot,
    chatbot_settings,
    pdf_data_source,
);
