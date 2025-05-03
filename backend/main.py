from fastapi import FastAPI
from planner import plan_task
from validator import validate_task
from skills.drill import drill_skill
from skills.move import move_skill

app = FastAPI()

@app.post("/validate")
async def validate(payload: dict):
    prompt = payload.get("prompt")
    result = validate_task(prompt)
    return result

@app.post("/plan")
async def plan(payload: dict):
    prompt = payload.get("prompt")
    result = plan_task(prompt)
    return result

@app.post("/execute_skill")
async def execute(payload: dict):
    task = payload.get("task")
    action = task.get("task", "")

    if action == "drill":
        result = drill_skill(task)
    elif action == "move":
        result = move_skill(task)
    else:
        result = "Unknown task"

    return {"status": "completed", "details": result}
