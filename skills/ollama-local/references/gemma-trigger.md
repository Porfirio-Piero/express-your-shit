# Gemma Local Trigger

## How to Use
Say any of these phrases to trigger the local Gemma 3 4B model:
- "ask gemma"
- "gemma local"
- "local model"
- "run it local"

## What Happens
The main agent spawns a sub-agent using `ollama/gemma3:4b` as the model, passing your question/task. The response comes back through the main agent.

## Model Info
- **Model:** gemma3:4b (Google Gemma 3, 4 billion params)
- **Size:** 3.3 GB on disk
- **Strengths:** Fast responses, good for quick Q&A, brainstorming, summaries
- **Limitations:** No tool use, smaller context window than cloud models

## Spawn Pattern
```
sessions_spawn(
  task="<your prompt>",
  model="ollama/gemma3:4b",
  label="gemma-local"
)
```