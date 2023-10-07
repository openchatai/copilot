from utils.db import Database


def trello_migration() -> None:
    db_instance = Database()
    mongo = db_instance.get_db()

    collection = mongo.customizer

    # Insert the documents into the collection
    insert_result = collection.find_one_and_update(
        {"platform": "trello"},
        {
            "$set": {
                "text": "You cannot create a card without a list",
                "constraints": "1. createList must always follow createBoard operation, if list was not defined user made a mistake and you should add one on your own.",
            }
        },
        upsert=True,
    )

    print("Trello System Text added succesfully")
