# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

### Cameras

- **OBSBOT Tiny 4K** → MAIN SECURITY CAM (always armed, auto-captures)
  - DirectShow name: `OBSBOT Tiny 4K Camera`
  - USB VID:PID: 3564:FEF4
  - Resolutions: 4K (3840x2160), 1080p (1920x1080), 720p (1280x720)
  - Capabilities: Motorized PTZ (requires OBSBOT Center app for pan/tilt control)
  - Role: Security — auto-monitored, motion detection, timelapse
  - NOTE: Needs 2s warmup for proper auto-exposure

- **Logitech BRIO** → MANUAL-ONLY CAM (snap/record on request only)
  - DirectShow name: `Logitech BRIO`
  - Resolutions: 1080p (1920x1080), 720p (1280x720)
  - Role: Manual — indoor tracking, requested by user only

- **Integrated Camera** → MANUAL-ONLY CAM (snap/record on request only)
  - DirectShow name: `Integrated Camera`
  - Resolutions: 720p (1280x720), 1080p
  - Role: Manual — requested by user only

**RULES:**
- OBSBOT = always armed, automatic security monitoring
- BRIO + Integrated = manual only, never auto-capture
- All storage goes to D:\camera\ (external drive)

### Camera Control Commands (from Telegram)

| Command | What it does |
|---------|-------------|
| `snap` or `📸` | Take a 1080p photo from OBSBOT |
| `snap 4k` | Take a 4K photo from OBSBOT |
| `snap brio` | Take a 1080p photo from Logitech BRIO |
| `snap int` | Take a 720p photo from Integrated Camera |
| `record 10` | Record 10s video from OBSBOT |
| `record 30` | Record 30s video from OBSBOT |
| `camera status` | Check all cameras online/offline |
| `camera list` | Show recent captures |

### ffmpeg Path

`C:\Users\devpi\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe`

### Camera Scripts

- `workspace/camera-tools/camera-server-v3.js` — HTTP control API (port 3199, multi-cam + external drive)
- `workspace/camera-tools/camera-config.js` — Camera config (3 cameras, roles, external drive paths)
- `workspace/camera-tools/camera-health-check.js` — Camera health monitor (port 3196, snaps every 30 min, never disrupts OBSBOT)
- `workspace/camera-tools/motion-tracker-v3.js` — Motion detection (port 3197, uses camera config)
- `workspace/camera-tools/security-watchdog.js` — Security watchdog (port 3198, uses camera config)
- `workspace/camera-tools/camera-server-v3.js` — Camera control API (port 3199, multi-cam + external drive)
- `workspace/camera-tools/security-watchdog.js` — Security watchdog (port 3198, uses camera config)
- `workspace/camera-tools/obsbot-snap-now.js` — Quick snap script
- `workspace/camera-tools/obsbot-video.js` — Video recording
- `workspace/camera-tools/list-dshow.js` — List DirectShow devices
- `workspace/camera-tools/list-hid.js` — List HID devices
- `workspace/camera-tools/resize.js` — Resize for Telegram sending

- `workspace/camera-tools/periodic-snap.js` — Periodic snap reporter (port 3202, every 45 min)
- `workspace/camera-tools/live-stream-server.js` — Live MJPEG stream (port 3200, reads live.jpg)
- `workspace/camera-tools/timelapse.js` — Timelapse compiler (port 3201, frame every 30s)

### Storage & USB

- **External Drive:** D:\ (Extreme SSD, 1.8TB free) — all camera storage
- **Camera directories:** D:\camera\snaps\, D:\camera\videos\, D:\camera\motion-events\, D:\camera\timelapse\
- CalDigit TS4 dock connected via USB4
- OBSBOT Tiny 4K connected through CalDigit dock
- Logitech BRIO connected (new indoor cam, manual-only)

### Vinny Vault — Windows Resource Steward

- **Agent:** vinny-vault
- **Workspace:** `C:\Users\devpi\.openclaw\workspace\vinny-vault\`
- **Schedule:** Every Sunday 9:00 AM ET (cron: `0 9 * * 0`)
- **Cron Job ID:** 371aa328-309a-45da-a431-94a2cad708a9
- **Authorization Level:** 0 (observe only, no destructive changes)
- **External Drive:** D:\ (Extreme SSD, exFAT, ~1.8TB free)
- **Backup Root:** `D:\VinnyVault\`
  - `D:\VinnyVault\ConfigBackups\` — Configuration backups
  - `D:\VinnyVault\Quarantine\` — Quarantined files
  - `D:\VinnyVault\Manifests\` — Backup manifests
- **Audit Script:** `vinny-vault\skills\windows-resource-steward\scripts\Invoke-VinnyVaultAudit.ps1`
- **Backup Script:** `vinny-vault\skills\windows-resource-steward\scripts\Backup-VinnyVaultConfigs.ps1`
- **Reports:** `vinny-vault\reports\` — Weekly snapshots and reports
- **Activity Log:** `vinny-vault\logs\activity.jsonl`
- **Sub-agents:** Connie Config, Tony Two-Disks, Frankie Fix-It, Nicky Containers, Gina GameSpace, Sal Security
- **On-demand:** Can be triggered anytime by asking BotFather to "run Vinny Vault audit"

<!-- clawx:begin -->
## ClawX Tool Notes

### uv (Python)

- `uv` is bundled with ClawX and on PATH. Do NOT use bare `python` or `pip`.
- Run scripts: `uv run python <script>` | Install packages: `uv pip install <package>`

### Browser

- `browser` tool provides full automation (scraping, form filling, testing) via an an isolated managed browser.
- Flow: `action="start"` → `action="snapshot"` (see page + get element refs like `e12`) → `action="act"` (click/type using refs).
- Open new tabs: `action="open"` with `targetUrl`.
- To just open a URL for the user to view, use `shell:openExternal` instead.
### Audio Recording

- **Script:** `D:\camera\all_day_recorder_v3.py` (Python, sounddevice/WDM-KS)
- **Device:** Auto-detect (prefers OBSBOT WDM-KS, falls back to Intel Mic Array)
- **Format:** 48kHz, 16-bit, stereo WAV, ~11MB/min
- **Segments:** 10-minute files in `D:\camera\audio\`
- **Start:** `python D:\camera\all_day_recorder_v3.py [hours] [device_index]`
- **CRITICAL:** MME, DirectSound, WASAPI all fail from session 0. Only WDM-KS works.
- **Device indices shift!** Always auto-detect, never hardcode.
- **Audacity** can't be automated from service session (keyboard automation blocked)
- **NAudio WASAPI** fails with "Not implemented" from service context

<!-- clawx:end -->