# DataLensAI

DataLensAI is a React/Vite analytics frontend backed by a modular FastAPI service. It accepts CSV, XLSX/XLS, JSON, and tabular PDF uploads, profiles real records, provides dataset-scoped analytics and natural-language analysis, supports AutoML/forecasting services, and includes the UPI payment submission/admin-review workflow.

## Project structure

```text
.
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── schemas.py
│   │   └── services/
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── public/
│   └── upi-qr.jpg
├── src/
│   ├── components/
│   ├── dashboard/
│   ├── sections/
│   └── services/api.js
├── package.json
├── vite.config.js
├── .env.example
└── README.md
```

## Requirements

- Node.js 18 or newer
- Python 3.10 or newer
- A configured merchant UPI ID for amount-prefilled UPI QR generation

## Local setup

### Backend

From the repository root in PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Set real deployment values in `backend\.env`. Never commit that file. `ADMIN_TOKEN` and `MERCHANT_UPI_ID` are server-side values and must not be placed in frontend environment variables.

### Frontend

In a second terminal:

```powershell
npm install
$env:VITE_API_URL = "http://localhost:8000"
npm run dev -- --host 127.0.0.1 --port 5173
```

Open the URL printed by Vite. If the frontend uses another port, include that origin in backend `ALLOWED_ORIGINS`.

## Configuration

`.env.example` contains variable names only. Copy the relevant template to a local environment file and provide values there:

| Variable | Used by | Purpose |
|---|---|---|
| `VITE_API_URL` | Frontend | FastAPI base URL |
| `APP_NAME` | Backend | API application name |
| `ALLOWED_ORIGINS` | Backend | Comma-separated browser origins |
| `MAX_UPLOAD_BYTES` | Backend | Maximum upload batch size |
| `DATASET_TTL_SECONDS` | Backend | In-memory dataset lifetime |
| `LLM_API_KEY` / `LLM_MODEL` | Backend | Optional provider configuration |
| `ADMIN_TOKEN` | Backend | Admin review authentication |
| `MERCHANT_UPI_ID` | Backend | Merchant UPI ID for dynamic payment intents |
| `DATABASE_PATH` | Backend | SQLite payment database path |
| `PAYMENT_SCREENSHOT_DIR` | Backend | Payment screenshot storage |
| `ADMIN_SESSION_TTL_SECONDS` | Backend | Admin session lifetime |

The backend creates the SQLite schema automatically at startup, including `payments` and `admin_sessions` tables. Runtime database files and screenshots are intentionally excluded from source control and the handoff archive.

## Payment workflow

The customer selects a configured plan, scans the amount-prefilled UPI intent, and submits a payment reference. The record remains `PENDING` until an authenticated administrator verifies it. A receipt number and final PDF acknowledgement are generated only after the record becomes `PAID`; pending or rejected submissions cannot download a receipt.

## Validation

```powershell
python -m pytest backend\tests -q
npm run build
```

The backend health check is `GET /health`. The frontend build output is generated in `dist/` and is not included in the source handoff archive.

## Deployment notes

- Deploy the frontend as a Vite static site and set `VITE_API_URL` to the deployed FastAPI URL.
- Deploy the backend with `python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT` or the equivalent platform command.
- Persist the configured SQLite database path and payment screenshot directory.
- Configure CORS with the deployed frontend origin.
- Keep all secrets in the hosting provider's secret/environment manager.
