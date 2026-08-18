# AI / Inventory Project
This repository contains two different kinds of work:

- a full-stack inventory management application with a FastAPI backend and React frontend
- a few standalone deep-learning / ML example scripts at the repository root

## Project structure

- `backend/` - FastAPI API and MongoDB integration
- `backend/server.py` - main backend app and API routes
- `backend/requirements.txt` - Python dependencies for the backend
- `backend/.env` - local environment values for the backend
- `frontend/` - frontend app configuration and source files
- `frontend/.env` - frontend environment settings
- `frontend/src/` - React app source code
- `simple_dl.py` - PyTorch training example
- `simple_dl_revision.py` - variant of the same example

## What the app does

The web app is an inventory tracker for managing items with:

- item creation
- search and filtering
- status tracking (checked in / checked out)
- barcode generation
- item history
- delete operations

The backend exposes REST endpoints under `/api` and stores records in MongoDB.

## Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB running locally

## Backend setup

From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

The backend expects MongoDB connection information from environment variables. The repo already includes a local configuration in `backend/.env`:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
```

Start MongoDB locally if it is not already running. Then start the API:

```bash
uvicorn backend.server:app --host 0.0.0.0 --port 8001 --reload
```

The backend will be available at:

- http://localhost:8001

## Frontend setup

The frontend configuration is in the `frontend/` folder, and it expects the backend at `http://localhost:8001`.

```bash
cd frontend
npm install
npm start
```

The frontend should launch in the browser on the default CRA development port, typically:

- http://localhost:3000

## Environment notes

The frontend includes a local config in `frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

If you change the backend port, update the frontend `.env` file as well.

## Running the app together

1. Start MongoDB
2. Start the backend using `uvicorn backend.server:app --host 0.0.0.0 --port 8001 --reload`
3. Start the frontend using `cd frontend && npm start`
4. Open the frontend in the browser

## Notes on the ML scripts

The files `simple_dl.py` and `simple_dl_revision.py` are standalone examples and are not part of the web app runtime. They appear to be exploratory PyTorch experiments and may depend on local dataset paths or hardware-specific settings.

## Troubleshooting

- If the backend fails to start, verify that MongoDB is running and that `MONGO_URL` / `DB_NAME` are set.
- If the frontend cannot reach the API, confirm `REACT_APP_BACKEND_URL` matches the backend URL.
- If the app has port collisions, update the backend port and the frontend environment value together.

## Summary

This repo is best thought of as a small inventory management project with a FastAPI + MongoDB backend and a React dashboard, plus a few unrelated ML experiments stored alongside it.





