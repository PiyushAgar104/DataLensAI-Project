from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

from app.config import settings


DATABASE_PATH = Path(settings.database_path)
DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)


def connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_database() -> None:
    with connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reference TEXT NOT NULL UNIQUE,
                customer_name TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                plan_name TEXT NOT NULL,
                amount TEXT NOT NULL,
                billing_duration TEXT NOT NULL,
                receipt_number TEXT UNIQUE,
                transaction_reference TEXT UNIQUE,
                screenshot_path TEXT,
                status TEXT NOT NULL CHECK (status IN ('PENDING', 'PAID', 'REJECTED')),
                created_at TEXT NOT NULL,
                reviewed_at TEXT,
                reviewed_by TEXT
            );
            CREATE TABLE IF NOT EXISTS admin_sessions (
                token_hash TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
            """
        )
        columns = {row["name"]: row for row in connection.execute("PRAGMA table_info(payments)").fetchall()}
        if "receipt_number" not in columns:
            connection.execute("ALTER TABLE payments ADD COLUMN receipt_number TEXT")
            connection.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_receipt_number ON payments(receipt_number)")
            columns = {row["name"]: row for row in connection.execute("PRAGMA table_info(payments)").fetchall()}
        transaction_info = columns.get("transaction_reference")
        if transaction_info is not None and transaction_info["notnull"] == 1:
            connection.execute("ALTER TABLE payments RENAME TO payments_legacy")
            connection.execute(
                """
                CREATE TABLE payments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    reference TEXT NOT NULL UNIQUE,
                    customer_name TEXT NOT NULL,
                    customer_email TEXT NOT NULL,
                    plan_name TEXT NOT NULL,
                    amount TEXT NOT NULL,
                    billing_duration TEXT NOT NULL,
                    receipt_number TEXT UNIQUE,
                    transaction_reference TEXT UNIQUE,
                    screenshot_path TEXT,
                    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PAID', 'REJECTED')),
                    created_at TEXT NOT NULL,
                    reviewed_at TEXT,
                    reviewed_by TEXT
                )
                """
            )
            connection.execute(
                """
                INSERT INTO payments
                (id, reference, customer_name, customer_email, plan_name, amount, billing_duration,
                 receipt_number, transaction_reference, screenshot_path, status, created_at, reviewed_at, reviewed_by)
                SELECT id, reference, customer_name, customer_email, plan_name, amount, billing_duration,
                       NULL, NULLIF(transaction_reference, ''), screenshot_path, status, created_at, reviewed_at, reviewed_by
                FROM payments_legacy
                """
            )
            connection.execute("DROP TABLE payments_legacy")
            connection.execute("CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)")


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return dict(row)
