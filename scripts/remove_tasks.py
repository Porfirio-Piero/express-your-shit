import json
from pathlib import Path

REMOVE_TASKS = {"task-061", "task-062", "task-063", "task-064"}
REMOVE_PROJECTS = {"proj-061"}

PATHS = [
    Path(r"C:/Users/devpi/.openclaw/workspace/memory/taskmaster.json"),
    Path(r"C:/Users/devpi/.openclaw/consiglio/tasktracker/tasktracker.json"),
]

for p in PATHS:
    data = json.loads(p.read_text(encoding="utf-8"))

    if isinstance(data.get("tasks"), list):
        before = len(data["tasks"])
        data["tasks"] = [t for t in data["tasks"] if t.get("id") not in REMOVE_TASKS]
        after = len(data["tasks"])
        print(f"{p.name}: tasks {before} -> {after}")

    pr = data.get("projectRegistry", {}).get("projects")
    if isinstance(pr, list):
        before = len(pr)
        data["projectRegistry"]["projects"] = [proj for proj in pr if proj.get("id") not in REMOVE_PROJECTS]
        after = len(data["projectRegistry"]["projects"])
        print(f"{p.name}: projects {before} -> {after}")

    p.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

print("done")
