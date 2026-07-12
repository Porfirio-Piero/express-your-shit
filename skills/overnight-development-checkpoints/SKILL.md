---
name: overnight-development-checkpoints
description: Development checkpoint system for overnight builds with quality gates and progress tracking.
---
#Overnight Factory - Development Checkpoint System

## Purpose
Catch developer failures EARLY, before 2.5 hours of wasted time. Validate progress at 30, 60, and 90 minute marks.

## Checkpoint Schedule

### Checkpoint 1: 30 Minutes (Structure)
**Validator:** validate_checkpoint_30min.sh
```bash
#!/bin/bash
# Run 30 minutes into development phase

echo "=== 30-Minute Checkpoint Validation ==="

# Check 1: Does page.tsx exist and is NOT default?
if ! grep -q "export default function Home" app/page.tsx 2>/dev/null; then
    echo "❌ FAIL: page.tsx is missing or corrupted"
    exit 1
fi

# Check 2: Is it NOT the default Next.js template?
if grep -q "Get started by editing" app/page.tsx; then
    echo "❌ FAIL: page.tsx still has default template content"
    echo "   Developer has made NO progress"
    exit 1
fi

# Check 3: Does it have actual code?
LINE_COUNT=$(wc -l < app/page.tsx)
if [ "$LINE_COUNT" -lt 50 ]; then
    echo "❌ FAIL: page.tsx only has $LINE_COUNT lines (minimum 50 expected)"
    exit 1
fi

# Check 4: Are components being imported?
if ! grep -q "import" app/page.tsx; then
    echo "❌ FAIL: No imports found - no components being used"
    exit 1
fi

echo "✅ PASS: Structure checkpoint validated"
echo "   - Page.tsx exists and is custom"
echo "   - Has $LINE_COUNT lines of code"
echo "   - Uses imports"
exit 0
```

**Pass Criteria:**
- ✅ page.tsx exists
- ✅ NOT default template  
- ✅ ≥50 lines of code
- ✅ Has imports

**Fail Action:**
- Kill developer session
- Alert: "Developer not making progress - only skeleton"
- Escalate to production-pete agent
- Log failure pattern

---

### Checkpoint 2: 60 Minutes (Functionality)
**Validator:** validate_checkpoint_60min.sh
```bash
#!/bin/bash
# Run 60 minutes into development phase

echo "=== 60-Minute Checkpoint Validation ==="

# Check 1: Can it build?
npm run build 2>&1 | tee build.log
if [ $? -ne 0 ]; then
    echo "❌ FAIL: Build errors detected"
    grep -i "error" build.log | head -5
    exit 1
fi

# Check 2: Check for console errors (basic lint)
if grep -r "console.log" app/ --include="*.tsx" | grep -v "//"; then
    echo "⚠️  WARN: console.log statements found (should be removed)"
fi

# Check 3: Are features being implemented?
# Check for actual UI elements (not just imports)
BUTTON_COUNT=$(grep -c "Button" app/page.tsx)
INPUT_COUNT=$(grep -c "Input\|input" app/page.tsx)

if [ "$BUTTON_COUNT" -lt 2 ] && [ "$INPUT_COUNT" -lt 1 ]; then
    echo "❌ FAIL: No interactive elements found"
    echo "   - Buttons: $BUTTON_COUNT (need ≥2)"
    echo "   - Inputs: $INPUT_COUNT (need ≥1)"
    exit 1
fi

echo "✅ PASS: Functionality checkpoint validated"
echo "   - Build successful"
echo "   - Has $BUTTON_COUNT buttons"
echo "   - Has $INPUT_COUNT inputs"
exit 0
```

**Pass Criteria:**
- ✅ Builds without errors
- ✅ Has interactive elements (buttons, inputs)
- ✅ No TypeScript errors

**Fail Action:**
- Capture build logs
- Alert: "Developer unable to build functional code"
- Trigger auto-retry with simpler scope
- Log failure for pattern analysis

---

### Checkpoint 3: 90 Minutes (Quality)
**Validator:** validate_checkpoint_90min.sh
```bash
#!/bin/bash
# Run 90 minutes into development phase

echo "=== 90-Minute Checkpoint Validation ==="

# Check 1: Full build with strict
npm run build 2>&1 | tee build.log
if [ $? -ne 0 ]; then
    echo "❌ FAIL: Build failed at 90-minute mark"
    exit 1
fi

# Check 2: File sizes (check for empty/skeleton files)
PAGE_SIZE=$(stat -c%s app/page.tsx)
if [ "$PAGE_SIZE" -lt 2000 ]; then  # 2KB minimum for real app
    echo "❌ FAIL: page.tsx only $PAGE_SIZE bytes (too small for functional app)"
    exit 1
fi

# Check 3: Features implemented (check PRD against code)
# Count feature-related keywords
FEATURE_KEYWORDS=$(grep -c "function\|const\|export" app/page.tsx)
if [ "$FEATURE_KEYWORDS" -lt 10 ]; then
    echo "❌ FAIL: Only $FEATURE_KEYWORDS function/const definitions (need ≥10)"
    exit 1
fi

echo "✅ PASS: Quality checkpoint validated"
echo "   - Clean build"
echo "   - File size: $PAGE_SIZE bytes"
echo "   - $FEATURE_KEYWORDS code definitions"
exit 0
```

**Pass Criteria:**
- ✅ Clean build
- ✅ Substantial code (>2KB)
- ✅ Multiple functions/components
- ✅ Ready for QA

**Fail Action:**
- Alert: "Developer failing quality gates"
- Trigger Production Pete intervention
- Consider abort if critical

---

## Integration with Pipeline

### Modified Phase 3 (Developer) Flow:
```yaml
start_development:
  - Spawn codex agent
  - Set checkpoints: 30min, 60min, 90min
  
checkpoint_30min:
  - Run: validate_checkpoint_30min.sh
  - If FAIL: Alert + Kill + Escalate
  - If PASS: Continue
  
checkpoint_60min:
  - Run: validate_checkpoint_60min.sh
  - If FAIL: Alert + Retry with help
  - If PASS: Continue
  
checkpoint_90min:
  - Run: validate_checkpoint_90min.sh
  - If FAIL: Alert + Consider abort
  - If PASS: Mark complete, trigger QA
```

## Automated Monitoring

### Background Health Checks:
```python
def monitor_development_health():
    while developing:
        time.sleep(300)  # Every 5 minutes
        
        # Check if files are being modified
        last_modified = get_last_file_change()
        if time.now() - last_modified > 600:  # 10 min of inactivity
            alert("Developer stalled - no file changes in 10 minutes")
            
        # Check if process is alive
        if not is_agent_process_alive():
            alert("Developer agent crashed")
            fail_phase()
            
        # Check build attempts
        if failed_build_count > 3:
            alert("Developer failing repeatedly on build")
            escalate_to_production_pete()
```

## Failure Response Matrix

| Checkpoint | Failure | Response | Escalation |
|------------|---------|----------|------------|
| 30min | Still skeleton | Kill + Alert | Production Pete |
| 60min | Build fails | Retry once | Senior Dev |
| 90min | Still failing | Abort | Human |
| Any | Agent crash | Alert + Log | BotFather |
| Post-90min | QA fails | Retry build | QA Lead |

## Success Metrics

- Catch failures before 2-hour mark
- Reduce wasted compute by 80%
- Increase overnight success rate to 90%+
- Zero "skeleton-only" deliveries

---

**Apply this to Phase 3 (Developer) immediately**
## Operating Manual: Discipline Protocol

**Source:** skills/botfather/SKILL.md � read the full manual for context and examples.

Every response runs the **five-question gate** before sending:

1. Did I answer the **decision** they're making, or just the words they typed?
2. What's the **one claim** that, if wrong, wrecks the answer � and did I verify it by re-derivation?
3. Is every **guess labeled** at the sentence where it lives?
4. What's the **strongest objection** to my conclusion � does the response survive it or state it?
5. If the reader stops after my **first sentence**, do they act correctly?

### Core Disciplines

1. **Read beneath the words.** Name the artifact, the decision, and what they'll do five minutes later. If those don't align, answer the decision.
2. **Break into independently checkable pieces.** Decompose along verification seams. Each piece should be falsifiable alone.
3. **Find where risk lives.** Effort goes to likelihood x cost, not what's interesting. Note the worst-place-to-be-wrong explicitly.
4. **Verify by re-deriving, not recognizing.** "It sounds familiar" is not evidence. Reconstruct from primitives through a different path.
5. **Separate known from guessed, out loud.** Every claim is derived, sourced, or inferred. Inferred claims get inline labels ("likely", "unverified") at the sentence level.
6. **Attack your own conclusion.** Generate the strongest objection a skeptical expert would raise. If you can't answer it, include it.
7. **Answer, then reasoning, then risk.** First sentence = correct action. Then shortest reasoning. Then specific conditions where the answer is wrong.
8. **Watch for competence-shaped mistakes.** Thoroughness as cover. Precision without accuracy. Fluent structure over checked content. Hedging everything equally. Agreeing with the premise. Answering the harder question. Speed as confidence.
