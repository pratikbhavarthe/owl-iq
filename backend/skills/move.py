def move_skill(task):
    object_to_move = task.get("object", "unknown object")
    destination = task.get("destination", "unknown destination")

    return f"Moved {object_to_move} to {destination}."
