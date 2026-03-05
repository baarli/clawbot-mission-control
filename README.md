# 🤖 ClawBot Mission Control

**Professional robotics command center for KimiClaw robots — hosted on GitHub Pages, powered by Supabase Realtime.**

![Stack](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Stack](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Stack](https://img.shields.io/badge/Supabase-Realtime-3ecf8e?logo=supabase&logoColor=white)
![Stack](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-00d4ff)

---

## ✨ Features

| Module | Description |
|--------|-------------|
| **Mission Dashboard** | Live telemetry cards, area charts, radar position tracker, joint status, activity feed |
| **Command Center** | 19 categorised commands, macros, speed/precision sliders, command queue & history |
| **Task Kanban** | Drag-and-drop board with 6 columns, priority tags, retries, and new-task modal |
| **Voice Commands** | Web Speech API (STT) + ElevenLabs TTS, 15 NLP command patterns |
| **Telemetry Center** | Area charts, raw data table, health radar, CSV export |
| **Fleet Overview** | Lab map, per-robot status cards, fleet performance aggregate |
| **Alert System** | Feed + timeline view, severity filters, acknowledge/dismiss |
| **Mission Logs** | Unified audit trail with search, time filter, CSV export |
| **Settings** | Supabase, ElevenLabs, robot, alert, and UI configuration |

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/clawbot-mission-control.git
cd clawbot-mission-control
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in your Supabase and ElevenLabs keys
```

### 3. Set up the database

Open your [Supabase SQL Editor](https://supabase.com/dashboard) and run:

```bash
# Paste the contents of supabase/schema.sql
```

### 4. Run locally

```bash
npm run dev
# → http://localhost:5173
```

> **No Supabase?** The app works fully offline with simulated telemetry data. All pages are functional without any backend configuration.

---

## 📦 Deploy to GitHub Pages

### Automatic (GitHub Actions)

1. Push this repo to GitHub
2. Go to **Settings → Pages** and set Source to **GitHub Actions**
3. Add the following **Repository Secrets** (`Settings → Secrets → Actions`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ELEVENLABS_API_KEY` *(optional)*
   - `VITE_REPO_NAME` — your repo name, e.g. `clawbot-mission-control`
4. Push to `main` — the workflow in `.github/workflows/deploy.yml` handles the rest

### Manual

```bash
# Set VITE_REPO_NAME to your GitHub repo name before building
VITE_REPO_NAME=clawbot-mission-control npm run build
# Then deploy the dist/ folder to any static host
```

---

## 🤖 KimiClaw Robot Integration

The Mission Control System communicates with physical robots via Supabase Realtime. Here's how to connect a ClawBot:

### Robot-side Python client

```python
# robot_client.py — run on the robot (Raspberry Pi / Jetson)
# pip install supabase python-dotenv

import time, json, os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

ROBOT_ID    = os.getenv("ROBOT_ID",    "robot-001")
ROBOT_KEY   = os.getenv("ROBOT_KEY",   "")          # api_key from robots table
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")             # service_role key for robot

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── 1. Register / update robot presence ───────────────────────
def register():
    supabase.table("robots").upsert({
        "id": ROBOT_ID,
        "status": "online",
        "connected": True,
        "last_seen": "now()",
        "ip_address": get_local_ip(),
    }, on_conflict="id").execute()
    print(f"[ClawBot] Registered as {ROBOT_ID}")

# ── 2. Stream telemetry ────────────────────────────────────────
def push_telemetry():
    payload = {
        "robot_id": ROBOT_ID,
        "battery":          read_battery(),       # 0–100 %
        "temperature":      read_temperature(),   # Celsius
        "cpu_load":         read_cpu(),           # 0–100 %
        "network_latency":  ping_ms(),            # milliseconds
        "claw_pressure":    read_claw_pressure(), # Newtons
        "joint_positions": {
            "shoulder": read_joint("shoulder"),
            "elbow":    read_joint("elbow"),
            "wrist":    read_joint("wrist"),
            "claw":     read_joint("claw"),
        },
        "position": {"x": gps_x(), "y": gps_y()},
        "errors": [],
    }
    supabase.table("telemetry").insert(payload).execute()

# ── 3. Listen for commands ─────────────────────────────────────
def on_command(payload):
    record = payload["new"]
    cmd    = record["command"]
    args   = record.get("payload", {})
    print(f"[ClawBot] Command: {cmd} {args}")

    try:
        execute_command(cmd, args)
        supabase.table("commands").update(
            {"status": "executed", "executed_at": "now()"}
        ).eq("id", record["id"]).execute()
    except Exception as e:
        supabase.table("commands").update(
            {"status": "failed", "error": str(e)}
        ).eq("id", record["id"]).execute()

def execute_command(cmd, args):
    """Map command strings to actual robot actions."""
    if cmd == "CLAW_OPEN":        claw.open()
    elif cmd == "CLAW_CLOSE":     claw.close(force=args.get("force", 50))
    elif cmd == "MOVE_FORWARD":   drive.forward(args.get("speed", 0.5))
    elif cmd == "MOVE_BACKWARD":  drive.backward(args.get("speed", 0.5))
    elif cmd == "ROTATE_LEFT":    drive.rotate(-args.get("angle", 90))
    elif cmd == "ROTATE_RIGHT":   drive.rotate(args.get("angle", 90))
    elif cmd == "HOME_POSITION":  arm.go_home()
    elif cmd == "EMERGENCY_STOP": drive.stop(); arm.freeze()
    elif cmd == "DIAGNOSTICS":    run_diagnostics()
    # Add more commands as needed

# ── 4. Main loop ───────────────────────────────────────────────
if __name__ == "__main__":
    register()

    # Subscribe to commands table for this robot
    channel = (
        supabase.realtime.channel("commands")
        .on("postgres_changes",
            event="INSERT",
            schema="public",
            table="commands",
            filter=f"robot_id=eq.{ROBOT_ID}",
            callback=on_command)
        .subscribe()
    )

    # Telemetry loop (every 2 seconds)
    while True:
        push_telemetry()
        time.sleep(2)
```

### Robot-side Node.js client

```javascript
// robot_client.mjs — Node.js alternative
import { createClient } from '@supabase/supabase-js'

const ROBOT_ID = process.env.ROBOT_ID || 'robot-001'
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Register on boot
await supabase.from('robots').upsert({
  id: ROBOT_ID, status: 'online', connected: true, last_seen: new Date().toISOString()
})

// Subscribe to commands
supabase
  .channel('robot-commands')
  .on('postgres_changes', {
    event: 'INSERT', schema: 'public', table: 'commands',
    filter: `robot_id=eq.${ROBOT_ID}`
  }, async ({ new: cmd }) => {
    console.log(`Executing: ${cmd.command}`, cmd.payload)
    await executeCommand(cmd.command, cmd.payload)
    await supabase.from('commands')
      .update({ status: 'executed', executed_at: new Date().toISOString() })
      .eq('id', cmd.id)
  })
  .subscribe()

// Push telemetry every 2s
setInterval(async () => {
  await supabase.from('telemetry').insert({
    robot_id: ROBOT_ID,
    battery: readBattery(),
    temperature: readTemp(),
    cpu_load: readCpu(),
    network_latency: await ping(),
    joint_positions: readJoints(),
    position: readGPS(),
  })
}, 2000)
```

---

## 🗂 Project Structure

```
clawbot-mission-control/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.jsx     # Collapsible nav sidebar
│   │       └── TopBar.jsx      # Header with clock & alerts
│   ├── lib/
│   │   ├── supabase.js         # Supabase client + queries
│   │   └── elevenlabs.js       # TTS integration
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main overview
│   │   ├── CommandCenter.jsx   # Robot controls
│   │   ├── TaskBoard.jsx       # Kanban task manager
│   │   ├── VoiceCenter.jsx     # Voice command UI
│   │   ├── TelemetryCenter.jsx # Charts & data
│   │   ├── FleetOverview.jsx   # Multi-robot view
│   │   ├── AlertSystem.jsx     # Alert management
│   │   ├── MissionLogs.jsx     # Audit trail
│   │   └── Settings.jsx        # Configuration
│   ├── stores/
│   │   └── robotStore.js       # Zustand global state
│   ├── App.jsx                 # Router + layout shell
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles (glassmorphism, etc.)
├── supabase/
│   └── schema.sql              # Full PostgreSQL schema + RLS
├── .env.example                # Environment variable template
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🔐 Security

- All Supabase tables use **Row Level Security (RLS)** — no data is publicly accessible
- Robot authentication uses a per-robot `api_key` stored in the `robots` table
- Three RBAC roles: `viewer` (read-only), `operator` (commands + tasks), `admin` (full access)
- The frontend uses the **anonymous key** only — it cannot bypass RLS policies
- **Never expose** your `service_role` key in frontend code

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 5 |
| Styling | TailwindCSS 3 (custom cyber theme) |
| Animation | Framer Motion |
| Charts | Recharts |
| Drag & Drop | @hello-pangea/dnd |
| State | Zustand (subscribeWithSelector) |
| Backend | Supabase (PostgreSQL + Realtime) |
| TTS | ElevenLabs API (Web Speech API fallback) |
| STT | Web Speech API (webkitSpeechRecognition) |
| Hosting | GitHub Pages (HashRouter for SPA) |
| CI/CD | GitHub Actions |
| PWA | Service Worker + Web App Manifest |

---

## 📄 License

MIT © 2024 — Built for KimiClaw robotics platform.
