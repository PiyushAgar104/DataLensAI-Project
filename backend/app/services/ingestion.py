from __future__ import annotations

import io
import json
from pathlib import Path
from typing import Any

import pandas as pd

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls", ".json", ".pdf"}


def _read_pdf(data: bytes) -> pd.DataFrame:
    try:
        import pdfplumber
    except ImportError as exc:
        raise ValueError("PDF support requires the optional pdfplumber dependency.") from exc

    rows: list[list[Any]] = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables() or []:
                rows.extend(table)
    if not rows:
        raise ValueError("No tabular data was found in the PDF.")
    header = [str(value or f"column_{index + 1}") for index, value in enumerate(rows[0])]
    return pd.DataFrame(rows[1:], columns=header)


def read_dataset(filename: str, data: bytes) -> dict[str, pd.DataFrame]:
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file type. Use CSV, XLSX, XLS, JSON, or a tabular PDF.")
    if not data:
        raise ValueError("The uploaded file is empty.")

    if extension == ".csv":
        try:
            return {"default": pd.read_csv(io.BytesIO(data), sep=None, engine="python")}
        except Exception as exc:
            raise ValueError(f"Unable to parse CSV: {exc}") from exc
    if extension in {".xlsx", ".xls"}:
        try:
            sheets = pd.read_excel(io.BytesIO(data), sheet_name=None)
            return {str(name): frame for name, frame in sheets.items()}
        except Exception as exc:
            raise ValueError(f"Unable to parse Excel workbook: {exc}") from exc
    if extension == ".json":
        try:
            payload = json.loads(data.decode("utf-8"))
            if isinstance(payload, dict):
                payload = payload.get("data", payload)
            frame = pd.json_normalize(payload)
            return {"default": frame}
        except Exception as exc:
            raise ValueError(f"Unable to parse JSON: {exc}") from exc
    return {"default": _read_pdf(data)}
