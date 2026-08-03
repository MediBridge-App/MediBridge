# Integration & End-to-End Tests

Owner: Raissa (Engineer 5). Tests the backend API against real Cognito auth
and real data — either the local Docker Postgres or the real RDS, depending
on which `DATABASE_URL` the backend you're testing against is using.

## What's covered

- `test_auth.py` — login, `/auth/me`, logout, invalid credentials
- `test_core_endpoints.py` — smoke tests for all 13 routers with real auth,
  plus two `xfail` tests tracking known bugs (hardcoded org id, null org
  fields on `/auth/me`) so they show up as expected failures instead of
  silently regressing further
- `test_document_flow.py` — full document journey: send → recipient inbox →
  audit log entry → status update → updated inbox, plus a cross-org
  authorization check
- `test_ai_pipeline_e2e.py` — **skipped placeholder** for the true async
  AI pipeline (SNS → SQS → Lambda → `ai_analyses`), pending Ayesha's
  infrastructure being live

## Setup

```bash
cd integration-tests
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# fill in DEMO_USER_*_PASSWORD in .env (ask the team, never commit real values)
```

Make sure the backend you want to test is running (locally: `uvicorn main:app
--reload --port 8000` from `api/`, with its own `.env` pointing at either the
local Docker Postgres or the real RDS via the SSM tunnel).

## Running

```bash
pytest -v
```

Run a single file:

```bash
pytest -v test_document_flow.py
```

Run everything except the AI pipeline placeholder (already skipped by
default, but explicit if you want it):

```bash
pytest -v --deselect test_ai_pipeline_e2e.py
```

## Notes

- Tests create real rows (a test document per run) — safe against local
  Docker, use judgment before running repeatedly against the real RDS.
- `xfail` tests are intentional: they document known bugs already flagged
  to the team (see Slack update 07/29). Once a bug is fixed, remove the
  `xfail` marker so the test enforces the fix going forward.
