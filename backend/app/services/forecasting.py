from __future__ import annotations

import numpy as np
import pandas as pd


def forecast(frame: pd.DataFrame, date_column: str | None, target_column: str | None, periods: int) -> dict:
    date_candidates = [date_column] if date_column else list(frame.columns)
    target_candidates = [target_column] if target_column else list(frame.columns)
    date_name = next((name for name in date_candidates if name and name in frame and pd.to_datetime(frame[name], errors="coerce").notna().sum() >= 3), None)
    target_name = next((name for name in target_candidates if name and name in frame and pd.to_numeric(frame[name], errors="coerce").notna().sum() >= 3), None)
    if not date_name or not target_name:
        raise ValueError("Forecasting requires a date column and a numeric target with at least three observations.")

    dates = pd.to_datetime(frame[date_name], errors="coerce")
    values = pd.to_numeric(frame[target_name], errors="coerce")
    series = pd.DataFrame({"date": dates, "value": values}).dropna().sort_values("date")
    if len(series) < 3 or series["date"].nunique() < 3:
        raise ValueError("Forecasting requires at least three distinct historical observations.")

    x = np.arange(len(series), dtype=float)
    y = series["value"].to_numpy(dtype=float)
    slope, intercept = np.polyfit(x, y, 1)
    residuals = y - (slope * x + intercept)
    std_error = float(np.std(residuals)) if len(residuals) > 1 else 0.0
    frequency = pd.infer_freq(series["date"]) or "D"
    future_dates = pd.date_range(series["date"].iloc[-1], periods=periods + 1, freq=frequency)[1:]
    predictions = [
        {"date": date.isoformat(), "value": round(float(slope * (len(series) + index) + intercept), 6), "lower": round(float(slope * (len(series) + index) + intercept - 1.96 * std_error), 6), "upper": round(float(slope * (len(series) + index) + intercept + 1.96 * std_error), 6)}
        for index, date in enumerate(future_dates)
    ]
    return {"date_column": date_name, "target_column": target_name, "frequency": frequency, "historical": [{"date": date.isoformat(), "value": float(value)} for date, value in series.tail(100).itertuples(index=False)], "forecast": predictions}
