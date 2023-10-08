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
                "constraints": "createList must always follow createBoard operation because cards can only be added to lists.",
            }
        },
        upsert=True,
    )

    print("Trello System Text added succesfully")
