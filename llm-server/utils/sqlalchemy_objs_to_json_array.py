from sqlalchemy.orm import class_mapper

def sqlalchemy_objs_to_json_array(objects):
    """Convert an array of SQLAlchemy objects to a JSON array."""
    def sqlalchemy_obj_to_dict(obj):
        columns = [column.key for column in class_mapper(obj.__class__).columns]
        return {column: getattr(obj, column) for column in columns}

    json_array = [sqlalchemy_obj_to_dict(obj) for obj in objects]
    return json_array