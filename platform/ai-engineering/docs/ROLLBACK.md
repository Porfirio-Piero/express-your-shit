# Rollback

The default installation is isolated under:

```text
platform/ai-engineering/
```

Rollback is therefore:

1. stop Open Claw
2. back up the overlay
3. remove the overlay directory
4. remove any explicit include or registration added by the local implementation agent
5. restart Open Claw
6. verify original agents and projects

The installer never intentionally edits files outside the namespace.

Any integration edit made later must:
- be backed up
- be recorded in the modernization report
- include an exact reverse operation
