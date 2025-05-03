def plan_task(prompt):
    if "drill" in prompt.lower():
        return {
            "task": "drill",
            "object": "yellow cuboid",
            "tool": "drill bit 1"
        }
    elif "move" in prompt.lower():
        return {
            "task": "move",
            "object": "box",
            "destination": "shelf 3"
        }
    else:
        return {"task": "unknown"}
