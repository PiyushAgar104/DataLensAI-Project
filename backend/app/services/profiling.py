from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
import re

from app.schemas import ColumnProfile, DatasetProfile


def _json_value(value: Any) -> Any:
    if value is None or pd.isna(value):
        return None
    if isinstance(value, (np.integer, np.floating)):
        return value.item()
    if isinstance(value, (pd.Timestamp,)):
        return value.isoformat()
    return value


def _detect_type(series: pd.Series) -> str:
    if pd.api.types.is_bool_dtype(series):
        return "boolean"
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"
    parsed = pd.to_datetime(series, errors="coerce")
    if len(series) and parsed.notna().mean() >= 0.8:
        return "datetime"
    if series.nunique(dropna=True) <= min(50, max(10, len(series) // 5)):
        return "categorical"
    return "text"


def _clean_frame(frame: pd.DataFrame) -> pd.DataFrame:
    cleaned = frame.copy()
    cleaned.columns = [str(column).strip() or f"column_{index + 1}" for index, column in enumerate(cleaned.columns)]
    cleaned = cleaned.replace(r"^\s*$", np.nan, regex=True)
    for column in cleaned.columns:
        if cleaned[column].dtype == "object":
            cleaned[column] = cleaned[column].map(lambda value: value.strip() if isinstance(value, str) else value)
    return cleaned


def profile_frame(dataset_id: str, name: str, frame: pd.DataFrame) -> DatasetProfile:
    frame = _clean_frame(frame)
    rows, columns_count = frame.shape
    duplicate_rows = int(frame.duplicated().sum())
    missing_cells = int(frame.isna().sum().sum())
    total_cells = max(rows * columns_count, 1)
    quality_score = round(max(0.0, 100 * (1 - (missing_cells + duplicate_rows) / total_cells)), 2)

    columns: list[ColumnProfile] = []
    numeric_summaries: dict[str, dict[str, float | int | None]] = {}
    categorical_summaries: dict[str, list[dict[str, Any]]] = {}
    grouped_summaries: dict[str, dict[str, list[dict[str, Any]]]] = {}
    datetime_columns: list[str] = []
    numeric_columns: list[str] = []

    for column in frame.columns:
        series = frame[column]
        detected_type = _detect_type(series)
        columns.append(
            ColumnProfile(
                name=str(column),
                type=detected_type,
                sample=_json_value(series.dropna().iloc[0]) if not series.dropna().empty else None,
                missing=int(series.isna().sum()),
                missing_pct=round(float(series.isna().mean() * 100), 2) if rows else 0,
                unique=int(series.nunique(dropna=True)),
            )
        )
        if detected_type == "numeric":
            numeric_columns.append(column)
            summary = series.describe()
            numeric_summaries[str(column)] = {
                **{key: _json_value(summary.get(key)) for key in ("count", "mean", "std", "min", "25%", "50%", "75%", "max")},
                "sum": _json_value(series.sum()),
            }
        elif detected_type == "categorical":
            counts = series.value_counts(dropna=True).head(10)
            categorical_summaries[str(column)] = [
                {"label": _json_value(label), "count": int(count), "percentage": round(float(count / max(rows, 1) * 100), 2)}
                for label, count in counts.items()
            ]
        elif detected_type == "datetime":
            datetime_columns.append(column)

    for categorical_column in categorical_summaries:
        for numeric_column in numeric_columns:
            grouped = (
                pd.DataFrame({
                    "label": frame[categorical_column],
                    "value": pd.to_numeric(frame[numeric_column], errors="coerce"),
                })
                .dropna(subset=["label", "value"])
                .groupby("label", as_index=False)
                .agg(total=("value", "sum"), mean=("value", "mean"), count=("value", "size"))
                .sort_values("total", ascending=False)
                .head(10)
            )
            grouped_summaries.setdefault(str(categorical_column), {})[str(numeric_column)] = [
                {
                    "label": _json_value(row.label),
                    "total": _json_value(row.total),
                    "mean": _json_value(row.mean),
                    "count": int(row.count),
                }
                for row in grouped.itertuples(index=False)
            ]

    time_series: list[dict[str, Any]] = []
    if datetime_columns and numeric_columns:
        date_column, value_column = datetime_columns[0], numeric_columns[0]
        dates = pd.to_datetime(frame[date_column], errors="coerce")
        values = pd.to_numeric(frame[value_column], errors="coerce")
        grouped = pd.DataFrame({"date": dates, "value": values}).dropna().groupby("date", as_index=False)["value"].sum()
        time_series = [{"date": date.isoformat(), "value": _json_value(value)} for date, value in grouped.tail(100).itertuples(index=False)]

    correlation = {
        str(row): {str(column): round(float(value), 6) for column, value in values.items() if pd.notna(value)}
        for row, values in frame[numeric_columns].corr().iterrows()
    } if len(numeric_columns) >= 2 else {}

    preview = [
        {str(column): _json_value(value) for column, value in row.items()}
        for row in frame.head(10).to_dict(orient="index").values()
    ]
    warnings: list[str] = []
    if missing_cells:
        warnings.append(f"{missing_cells} missing cells detected.")
    if duplicate_rows:
        warnings.append(f"{duplicate_rows} duplicate rows detected.")
    if not numeric_columns:
        warnings.append("No numeric columns are available for numeric analytics.")

    insights: list[dict[str, Any]] = []
    business_metrics: dict[str, Any] = {}
    primary_numeric = numeric_columns[0] if numeric_columns else None
    profit_column = next((column for column in numeric_columns if "profit|margin|income" in str(column).lower()), None)
    customer_column = next((column for column in frame.columns if re.search(r"customer|client|user|account", str(column), re.I)), None)
    region_column = next((column for column in frame.columns if re.search(r"region|country|state|city|territory", str(column), re.I)), None)
    category_column = next((column for column in frame.columns if re.search(r"category|product|item|department", str(column), re.I)), None)
    if primary_numeric:
        total = float(pd.to_numeric(frame[primary_numeric], errors="coerce").sum())
        average = float(pd.to_numeric(frame[primary_numeric], errors="coerce").mean())
        business_metrics.update({"primary_numeric_column": str(primary_numeric), "total": _json_value(total), "average": _json_value(average)})
        if category_column:
            grouped = grouped_summaries.get(str(category_column), {}).get(str(primary_numeric), [])
            if grouped:
                top = grouped[0]
                share = round(float(top["total"]) / total * 100, 2) if total else 0
                insights.append({
                    "category": "Product performance",
                    "title": f"{top['label']} is the strongest contributor",
                    "explanation": f"{top['label']} generated {share}% of {primary_numeric} ({top['total']:,.2f}). This is the leading contributor in the uploaded data.",
                    "metric": {"column": str(primary_numeric), "value": top["total"], "share_pct": share},
                    "importance": "High" if share >= 50 else "Medium",
                    "action": f"Review {top['label']} inventory, pricing, and promotion before expanding lower-performing items.",
                })
        if len(numeric_columns) and len(frame) >= 4:
            values = pd.to_numeric(frame[primary_numeric], errors="coerce").dropna()
            if len(values) >= 4:
                q1, q3 = values.quantile([0.25, 0.75])
                outliers = int(((values < q1 - 1.5 * (q3 - q1)) | (values > q3 + 1.5 * (q3 - q1))).sum())
                business_metrics["outlier_count"] = outliers
                if outliers:
                    insights.append({
                        "category": "Anomalies & risks",
                        "title": f"{outliers} unusual {primary_numeric} value(s) detected",
                        "explanation": "A small number of records sit well outside the normal range and may affect averages or business decisions.",
                        "metric": {"column": str(primary_numeric), "value": outliers},
                        "importance": "Medium",
                        "action": "Review the flagged records for data-entry errors, exceptional transactions, or genuine one-off events.",
                    })
    if profit_column and primary_numeric:
        profit_total = float(pd.to_numeric(frame[profit_column], errors="coerce").sum())
        revenue_total = float(pd.to_numeric(frame[primary_numeric], errors="coerce").sum())
        margin = round(profit_total / revenue_total * 100, 2) if revenue_total else None
        business_metrics.update({"profit_column": str(profit_column), "profit_total": _json_value(profit_total), "profit_margin_pct": margin})
        if margin is not None:
            insights.append({
                "category": "Profitability",
                "title": f"Profit margin is {margin}%",
                "explanation": f"{profit_column} contributes {profit_total:,.2f} against {primary_numeric} of {revenue_total:,.2f}.",
                "metric": {"column": str(profit_column), "value": profit_total, "margin_pct": margin},
                "importance": "High" if margin < 10 else "Informational",
                "action": "Compare margin by product or category before changing prices or discounts.",
            })
    if customer_column:
        unique_customers = int(frame[customer_column].nunique(dropna=True))
        business_metrics.update({"customer_column": str(customer_column), "unique_customers": unique_customers})
        insights.append({
            "category": "Customer behaviour",
            "title": f"{unique_customers:,} unique customers identified",
            "explanation": f"The dataset contains {unique_customers:,} distinct values in {customer_column}.",
            "metric": {"column": str(customer_column), "value": unique_customers},
            "importance": "Informational",
            "action": "Use this field for repeat-purchase and customer-value analysis when order history is available.",
        })
    if region_column and primary_numeric:
        grouped = grouped_summaries.get(str(region_column), {}).get(str(primary_numeric), [])
        if grouped:
            insights.append({
                "category": "Regional performance",
                "title": f"{grouped[0]['label']} leads by {primary_numeric}",
                "explanation": f"{grouped[0]['label']} has the largest grouped total at {grouped[0]['total']:,.2f}.",
                "metric": {"column": str(region_column), "value": grouped[0]["label"], "total": grouped[0]["total"]},
                "importance": "Medium",
                "action": "Compare the leading and trailing regions for distribution, demand, and growth opportunities.",
            })
    if missing_cells or duplicate_rows:
        insights.append({
            "category": "Data quality",
            "title": "Data quality needs attention",
            "explanation": f"The file contains {missing_cells:,} missing cells and {duplicate_rows:,} duplicate rows.",
            "metric": {"missing_cells": missing_cells, "duplicate_rows": duplicate_rows, "quality_score": quality_score},
            "importance": "High" if quality_score < 90 else "Medium",
            "action": "Clean or validate affected records before using the results for financial or operational decisions.",
        })

    return DatasetProfile(
        dataset_id=dataset_id,
        name=name,
        rows=rows,
        columns_count=columns_count,
        quality_score=quality_score,
        duplicate_rows=duplicate_rows,
        missing_cells=missing_cells,
        columns=columns,
        numeric_summaries=numeric_summaries,
        categorical_summaries=categorical_summaries,
        grouped_summaries=grouped_summaries,
        time_series=time_series,
        correlation=correlation,
        preview=preview,
        warnings=warnings,
        insights=insights,
        business_metrics=business_metrics,
    )
