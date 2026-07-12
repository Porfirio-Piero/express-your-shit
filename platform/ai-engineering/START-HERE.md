# START HERE — OPEN CLAW PLATFORM IMPORT

This ZIP is the complete import package.

Read in this order:

1. `README.md`
2. `prompts/IMPLEMENT-PLATFORM.md`
3. `prompts/IMPLEMENT-SELECTIVE-OVERLAY.md`
4. `prompts/IMPLEMENT-WEEKLY-MODEL-SCOUT.md`
4. `docs/TELEGRAM-IMPORT.md`

Critical facts:

- Ollama is cloud-only in this environment.
- No Ollama models are ever run locally.
- Do not recommend local hardware fit, quantization, or local model sizes.
- Do not add hard-coded model recommendations.
- Preserve all existing personalities and operational context.
- Install as a non-destructive overlay.
- Audit and show the proposed diff before modifying existing files.

Operating rule:
- BotFather remains the sole primary orchestrator.
- Specialist agents are reference-on-demand except Mikey Models.

5. `prompts/IMPLEMENT-PERSONALITY-PROFILES.md`
6. `standards/AGENT-PERSONALITY-STANDARD.md`

7. `prompts/IMPLEMENT-ITALIAN-AMERICAN-VOICE.md`
8. `standards/ITALIAN-AMERICAN-LANGUAGE-STANDARD.md`
