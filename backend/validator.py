def validate_task(prompt):
    missing_params = []
    if "drill" not in prompt.lower():
        missing_params.append("No drilling action specified")
    if "yellow cuboid" not in prompt.lower():
        missing_params.append("Target object missing")

    if missing_params:
        return {"is_valid": False, "missing": missing_params}
    else:
        return {"is_valid": True}
