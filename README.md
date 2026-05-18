# TAP — AI Financial Fraud Detection (Kafka + Python + React/Vite)

A real-time, dual-stream fraud detection platform that ingests **transaction** and **behavioural** signals via Kafka, scores events with ML models, and provides analyst tooling (dashboards + audit-ready compliance summaries).

- Kafka workflow with transactions keyed by `link_id` for consistent partitioning.
- Model highlights (per project slides): 99%+ accuracy with XGBoost/ensembles; dual-stream runtime; ~70% fewer false positives.

## Key Features

- **Live streaming & scoring:** Kafka producers/consumers for transaction + behavioural pipelines.  
- **Dashboards:** Risk metrics, investigations queue, geo views, and model stats.  
- **Compliance reports:** Auto-generated summaries mapped to AU/SG standards (draft → export).  
- **Security (WIP):** RBAC baseline present; multi-tier roles planned.

---

## Quick Start

### 0) Prerequisites
- **Python** 3.10+
- **Node.js** 18+ (with npm)
- **Java** 11+ (Kafka runtime)
- Local **Kafka** will be started by the provided script.

### 1) Clone
```bash
git clone https://github.com/thinganhado/TAP.git
cd TAP
```

### 2) Backend dependencies (choose one)

**Conda (recommended)**
```bash
conda env create -f environment.yml
conda activate tap
```

**Pip**
```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3) Frontend dependencies
```bash
npm ci
# Dev
npm run dev    # Vite dev server (default http://localhost:5173)
# or Build + preview
npm run build
npm run preview
```

### 4) Start Kafka & services

Use the helper script to spin up Kafka (and the app services it orchestrates):
```bash
bash scripts/start_all
```

Stop everything:
```bash
bash scripts/stop_all
```

Entry points include:
```bash
# Flask/socket services
python frontend.py          # serves API/socket endpoints (default :8000)
python behaviour.py         # behavioural model service

# Kafka data replayer (sample stream)
python scripts/producer_replayer.py
# or send a single test event
python send_one.py
```

### 5) Configure

- Set your Kafka/MySQL/app settings in the project’s config (e.g., `config.py` / `.env` if present).
- Ensure `BOOTSTRAP_SERVERS`, DB creds, and model paths are correct for your environment.

---

## Typical Workflow

1. **Start Kafka** and backend services (`bash scripts/start_all`).  
2. **Stream data** (use `producer_replayer.py` or your live source).  
3. **Open the UI** (Vite dev: <http://localhost:5173>) and monitor dashboards.  
4. **Investigate & report** from the Investigations/Reports pages.
