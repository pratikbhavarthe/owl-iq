def drill_skill(task):
    object_to_drill = task.get("object", "unknown object")
    tool = task.get("tool", "default tool")

    return f"Drilled hole in {object_to_drill} using {tool}."
