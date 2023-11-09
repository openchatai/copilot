
use diesel::prelude::*;
use diesel::result::Error;

use crate::models::chatbot::Chatbot;
use crate::schema::chatbots::{self, website};

fn create_chatbot(conn: &mut MysqlConnection, chatbot: Chatbot) -> Result<Chatbot, Error> {
    diesel::insert_into(chatbots::table)
        .values(&chatbot)
        .returning(Chatbot::as_returning())
        .get_result(conn)?
}

fn get_chatbot_by_id(conn: &MysqlConnection, chatbot_id: &str) -> Result<Chatbot, Error> {
    chatbots::table.find(chatbot_id).first(conn)
}

fn update_chatbot(conn: &mut MysqlConnection, chatbot_id: &str, chatbot: Chatbot) -> Result<Chatbot, Error> {
    // diesel::update(chatbots::table.find(chatbot_id))
    //     .set(&chatbot)
    //     .get_result(conn)

    diesel::update(chatbots::table.find(chatbot_id))
        .set(website.eq("asdf"))
        .returning(Chatbot::as_returning())
        .get_result(conn)?
}


fn delete_chatbot(conn: &MysqlConnection, chatbot_id: &str) -> Result<usize, Error> {
    diesel::delete(chatbots::table.find(chatbot_id)).execute(conn)
}