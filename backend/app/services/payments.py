from __future__ import annotations

import datetime as dt
import hashlib
import io
import secrets
import uuid
from pathlib import Path
from typing import Any

from app.config import settings
from app.services.database import connect, row_to_dict


def _now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


def _public_payment(row: dict[str, Any]) -> dict[str, Any]:
    screenshot_path = row.pop("screenshot_path", None)
    row["has_screenshot"] = bool(screenshot_path)
    return row


def build_receipt_pdf(payment: dict[str, Any], status: str) -> bytes:
    lines = [
        "DataLensAI",
        "Professional Software Subscription Fee Receipt",
        f"Receipt number: {payment['receipt_number']}",
        f"Receipt date and time: {payment['created_at'].replace('T', ' ')}",
        f"Customer: {payment['customer_name']}",
        f"Email: {payment['customer_email']}",
        f"Plan: {payment['plan_name']}",
        f"Duration: {payment['billing_duration']}",
        f"Amount: {payment['amount']}",
        "Payment method: UPI",
        f"Transaction reference: {payment['transaction_reference'] or 'Not supplied'}",
        f"Payment status: {status}",
        "Merchant contact: 9399895095",
        "Author / Developer: Piyush Agar",
    ]
    stream = ["BT", "/F1 11 Tf", "50 760 Td"]
    for index, line in enumerate(lines):
        if index:
            stream.append("0 -22 Td")
        stream.append(f"({_pdf_escape(line)}) Tj")
    stream.append("ET")
    body = "\n".join(stream).encode("latin-1", "replace")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        f"<< /Length {len(body)} >>\nstream\n".encode() + body + b"\nendstream",
    ]
    output = io.BytesIO(b"%PDF-1.4\n")
    offsets = [0]
    for number, obj in enumerate(objects, 1):
        offsets.append(output.tell())
        output.write(f"{number} 0 obj\n".encode())
        output.write(obj)
        output.write(b"\nendobj\n")
    xref = output.tell()
    output.write(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode())
    for offset in offsets[1:]:
        output.write(f"{offset:010d} 00000 n \n".encode())
    output.write(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF".encode())
    return output.getvalue()


def _pdf_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def create_payment(customer_name: str | None, customer_email: str | None, plan_name: str, amount: str, billing_duration: str, transaction_reference: str | None, screenshot_name: str | None, screenshot: bytes | None) -> dict[str, Any]:
    now = _now()
    reference = f"DL-{dt.datetime.now(dt.timezone.utc):%Y%m%d}-{uuid.uuid4().hex[:8].upper()}"
    screenshot_path = None
    if screenshot:
        screenshot_dir = Path(settings.payment_screenshot_dir)
        screenshot_dir.mkdir(parents=True, exist_ok=True)
        suffix = Path(screenshot_name or "").suffix.lower()
        if suffix not in {".png", ".jpg", ".jpeg", ".webp"}:
            raise ValueError("Payment screenshots must be PNG, JPG, JPEG, or WEBP files.")
        screenshot_path = str(screenshot_dir / f"{reference}{suffix}")
        Path(screenshot_path).write_bytes(screenshot)
    try:
        with connect() as connection:
            connection.execute(
                """
                INSERT INTO payments
                (reference, customer_name, customer_email, plan_name, amount, billing_duration,
                 transaction_reference, screenshot_path, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
                """,
                (reference, customer_name or "Not provided", customer_email or "Not provided", plan_name, amount, billing_duration, transaction_reference or None, screenshot_path, now),
            )
            row = connection.execute("SELECT * FROM payments WHERE reference = ?", (reference,)).fetchone()
    except Exception:
        if screenshot_path:
            Path(screenshot_path).unlink(missing_ok=True)
        raise
    return _public_payment(row_to_dict(row))


def list_payments(status: str | None = None) -> list[dict[str, Any]]:
    with connect() as connection:
        if status:
            rows = connection.execute("SELECT * FROM payments WHERE status = ? ORDER BY created_at DESC", (status,)).fetchall()
        else:
            rows = connection.execute("SELECT * FROM payments ORDER BY created_at DESC").fetchall()
    return [_public_payment(row_to_dict(row)) for row in rows]


def get_payment(reference: str) -> dict[str, Any] | None:
    with connect() as connection:
        row = connection.execute("SELECT * FROM payments WHERE reference = ?", (reference,)).fetchone()
    return row_to_dict(row) if row else None


def review_payment(reference: str, decision: str, reviewer: str) -> dict[str, Any]:
    if decision not in {"approve", "reject"}:
        raise ValueError("Decision must be approve or reject.")
    next_status = "PAID" if decision == "approve" else "REJECTED"
    reviewed_at = _now()
    receipt_number = f"DLR-{dt.datetime.now(dt.timezone.utc):%Y%m%d}-{uuid.uuid4().hex[:8].upper()}" if next_status == "PAID" else None
    with connect() as connection:
        cursor = connection.execute(
            """
            UPDATE payments
            SET status = ?, receipt_number = ?, reviewed_at = ?, reviewed_by = ?
            WHERE reference = ? AND status = 'PENDING'
            """,
            (next_status, receipt_number, reviewed_at, reviewer, reference),
        )
        if cursor.rowcount != 1:
            row = connection.execute("SELECT * FROM payments WHERE reference = ?", (reference,)).fetchone()
            if not row:
                raise KeyError("Payment submission not found.")
            raise ValueError(f"Payment is already {row['status']} and cannot be changed.")
        row = connection.execute("SELECT * FROM payments WHERE reference = ?", (reference,)).fetchone()
    return _public_payment(row_to_dict(row))


def create_admin_session() -> str:
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    created = dt.datetime.now(dt.timezone.utc)
    expires = created + dt.timedelta(seconds=settings.admin_session_ttl_seconds)
    with connect() as connection:
        connection.execute("DELETE FROM admin_sessions WHERE expires_at <= ?", (created.isoformat(),))
        connection.execute("INSERT INTO admin_sessions (token_hash, created_at, expires_at) VALUES (?, ?, ?)", (token_hash, created.isoformat(), expires.isoformat()))
    return raw_token


def admin_session_is_valid(raw_token: str | None) -> bool:
    if not raw_token:
        return False
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    with connect() as connection:
        row = connection.execute("SELECT 1 FROM admin_sessions WHERE token_hash = ? AND expires_at > ?", (token_hash, _now())).fetchone()
    return row is not None


def delete_admin_session(raw_token: str | None) -> None:
    if raw_token:
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        with connect() as connection:
            connection.execute("DELETE FROM admin_sessions WHERE token_hash = ?", (token_hash,))
