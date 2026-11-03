from __future__ import annotations

import time
import uuid
from typing import Any
from sqlite3 import IntegrityError

import pandas as pd
from fastapi import Cookie, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas import AutoMLRequest, ChatRequest, ChatResponse, DatasetProfile, ForecastRequest
from app.services.analyst import answer_question
from app.services.automl import train_model
from app.services.forecasting import forecast
from app.services.ingestion import read_dataset
from app.services.profiling import profile_frame
from app.services.database import init_database
from app.services.payments import (
    admin_session_is_valid,
    build_receipt_pdf,
    create_admin_session,
    create_payment,
    delete_admin_session,
    get_payment,
    list_payments,
    review_payment as update_payment_status,
)

app = FastAPI(title=settings.app_name, version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
datasets: dict[str, dict[str, Any]] = {}
init_database()


@app.middleware("http")
async def no_cache_api_responses(request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response


def _get_dataset(dataset_id: str) -> pd.DataFrame:
    record = datasets.get(dataset_id)
    if not record or time.time() - record["created_at"] > settings.dataset_ttl_seconds:
        datasets.pop(dataset_id, None)
        raise HTTPException(status_code=404, detail="Dataset not found or expired. Upload it again.")
    return record["frame"]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/payments")
async def submit_payment(
    customer_name: str | None = Form(default=None),
    customer_email: str | None = Form(default=None),
    plan_name: str = Form(...),
    amount: str = Form(...),
    billing_duration: str = Form("Monthly"),
    transaction_reference: str | None = Form(default=None),
    screenshot: UploadFile | None = File(None),
) -> dict:
    image = await screenshot.read() if screenshot else None
    try:
        return create_payment(customer_name, customer_email, plan_name, amount, billing_duration, transaction_reference, screenshot.filename if screenshot else None, image)
    except IntegrityError as exc:
        raise HTTPException(status_code=409, detail="This UPI transaction reference has already been submitted.") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/api/payments/config")
def payment_config() -> dict[str, str | None]:
    return {"merchant_upi_id": settings.merchant_upi_id}


@app.get("/api/payments/{reference}/status")
def payment_status(reference: str) -> dict[str, str | None]:
    payment = get_payment(reference)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment submission not found.")
    return {
        "status": payment["status"],
        "receipt_number": payment["receipt_number"] if payment["status"] == "PAID" else None,
    }


def _require_admin(admin_session: str | None) -> None:
    if not settings.admin_token or not admin_session_is_valid(admin_session):
        raise HTTPException(status_code=401, detail="Admin authorization required.")


@app.get("/api/admin/payments")
def admin_payment_list(status: str | None = None, admin_session: str | None = Cookie(default=None)) -> list[dict]:
    _require_admin(admin_session)
    if status and status not in {"PENDING", "PAID", "REJECTED"}:
        raise HTTPException(status_code=400, detail="Unknown payment status.")
    return list_payments(status)


@app.post("/api/admin/payments/{reference}/{decision}")
def review_payment(reference: str, decision: str, admin_session: str | None = Cookie(default=None)) -> dict:
    _require_admin(admin_session)
    try:
        return update_payment_status(reference, decision, "admin")
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.post("/api/admin/login")
def admin_login(admin_password: str = Form(...)) -> Response:
    if not settings.admin_token or admin_password != settings.admin_token:
        raise HTTPException(status_code=401, detail="Invalid admin credentials.")
    response = Response(content='{"authenticated":true}', media_type="application/json")
    response.set_cookie("admin_session", create_admin_session(), httponly=True, samesite="lax", secure=False, max_age=settings.admin_session_ttl_seconds)
    return response


@app.post("/api/admin/logout")
def admin_logout(admin_session: str | None = Cookie(default=None)) -> Response:
    delete_admin_session(admin_session)
    response = Response(content='{"authenticated":false}', media_type="application/json")
    response.delete_cookie("admin_session")
    return response


@app.get("/api/admin/session")
def admin_session(admin_session: str | None = Cookie(default=None)) -> dict[str, bool]:
    return {"authenticated": bool(settings.admin_token and admin_session_is_valid(admin_session))}


@app.get("/api/admin/payments/{reference}/screenshot")
def payment_screenshot(reference: str, admin_session: str | None = Cookie(default=None)) -> Response:
    _require_admin(admin_session)
    payment = get_payment(reference)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment submission not found.")
    screenshot_path = payment.get("screenshot_path")
    if not screenshot_path:
        raise HTTPException(status_code=404, detail="No screenshot was submitted.")
    from pathlib import Path
    path = Path(screenshot_path)
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Screenshot file is unavailable.")
    media_type = "image/jpeg" if path.suffix.lower() in {".jpg", ".jpeg"} else f"image/{path.suffix.lower().lstrip('.')}"
    return Response(content=path.read_bytes(), media_type=media_type)


@app.get("/api/payments/{reference}/receipt")
def payment_receipt(reference: str) -> Response:
    payment = get_payment(reference)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment submission not found.")
    if payment["status"] != "PAID" or not payment["receipt_number"]:
        raise HTTPException(status_code=409, detail="Receipt is available only after successful payment verification.")
    return Response(content=build_receipt_pdf(payment, "PAID"), media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{payment["receipt_number"]}.pdf"'})


@app.post("/api/datasets/upload", response_model=DatasetProfile)
async def upload_dataset(files: list[UploadFile] = File(default=[]), file: UploadFile | None = File(default=None)) -> DatasetProfile:
    selected_files = list(files)
    if file is not None:
        selected_files.append(file)
    if not selected_files:
        raise HTTPException(status_code=422, detail="Select at least one file to upload.")
    if len(selected_files) > 5:
        raise HTTPException(status_code=413, detail="Upload limit exceeded. You can upload a maximum of 5 files at a time.")
    try:
        frames = []
        names = []
        total_bytes = 0
        for selected_file in selected_files:
            data = await selected_file.read()
            total_bytes += len(data)
            if total_bytes > settings.max_upload_bytes:
                raise HTTPException(status_code=413, detail="The upload batch exceeds the configured 50 MB limit.")
            sheets = read_dataset(selected_file.filename or "dataset", data)
            frame = next((sheet for sheet in sheets.values() if not sheet.empty), None)
            if frame is None:
                raise ValueError(f"{selected_file.filename or 'Dataset'} contains no non-empty sheet.")
            frames.append(frame)
            names.append(selected_file.filename or "dataset")
        frame = pd.concat(frames, ignore_index=True, sort=False)
        dataset_id = str(uuid.uuid4())
        datasets[dataset_id] = {"created_at": time.time(), "frame": frame}
        return profile_frame(dataset_id, ", ".join(names), frame)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/api/datasets/{dataset_id}/chat", response_model=ChatResponse)
def dataset_chat(dataset_id: str, request: ChatRequest) -> ChatResponse:
    return ChatResponse(**answer_question(_get_dataset(dataset_id), request.question, request.history))


@app.post("/api/datasets/{dataset_id}/forecast")
def dataset_forecast(dataset_id: str, request: ForecastRequest) -> dict:
    try:
        return forecast(_get_dataset(dataset_id), request.date_column, request.target_column, request.periods)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/api/datasets/{dataset_id}/automl")
def dataset_automl(dataset_id: str, request: AutoMLRequest) -> dict:
    try:
        return train_model(_get_dataset(dataset_id), request.task, request.target_column, request.test_size)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
