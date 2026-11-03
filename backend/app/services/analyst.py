from __future__ import annotations

import re
from typing import Any

import pandas as pd

from app.services.analytics import dataset_metrics


_METRIC_WORDS = {
    "revenue": r"revenue|sales|turnover|income",
    "profit": r"profit|margin",
    "quantity": r"quantity|units|volume",
    "orders": r"order|orders|transaction|count",
}
_GROUP_WORDS = {
    "product": r"product|item|sku",
    "category": r"categor|department|class",
    "region": r"region|country|state|city|territory|area",
    "customer": r"customer|client|account|user",
    "segment": r"segment|cohort|tier",
}


def _columns(frame: pd.DataFrame, pattern: str) -> list[str]:
    return [str(column) for column in frame.columns if re.search(pattern, str(column), re.I)]


def _numeric_columns(frame: pd.DataFrame) -> list[str]:
    return [str(column) for column in frame.select_dtypes(include="number").columns]


def _date_columns(frame: pd.DataFrame) -> list[str]:
    found = []
    for column in frame.columns:
        if pd.api.types.is_datetime64_any_dtype(frame[column]):
            found.append(str(column))
            continue
        if re.search(r"date|time|month|year", str(column), re.I):
            parsed = pd.to_datetime(frame[column], errors="coerce")
            if parsed.notna().mean() >= 0.6:
                found.append(str(column))
    return found


def _choose_metric(frame: pd.DataFrame, question: str) -> str | None:
    numeric = _numeric_columns(frame)
    for key, pattern in _METRIC_WORDS.items():
        if re.search(pattern, question, re.I):
            match = _columns(frame, pattern)
            if match:
                return match[0]
            if key == "orders":
                return None
    return numeric[0] if numeric else None


def _choose_group(frame: pd.DataFrame, question: str) -> str | None:
    for _, pattern in _GROUP_WORDS.items():
        match = _columns(frame, pattern)
        if match and re.search(pattern, question, re.I):
            return match[0]
    for pattern in _GROUP_WORDS.values():
        match = _columns(frame, pattern)
        if match:
            return match[0]
    categorical = frame.select_dtypes(exclude="number").columns
    return str(categorical[0]) if len(categorical) else None


def _money(value: float) -> str:
    return f"{value:,.2f}"


def _evidence(metric: str, value: Any, **extra: Any) -> dict[str, Any]:
    return {"metric": metric, "value": value, **extra}


def _history_context(history: list[dict[str, str]] | None) -> tuple[str | None, list[dict[str, Any]]]:
    if not history:
        return None, []
    for item in reversed(history):
        if item.get("sender") == "bot":
            return item.get("text"), item.get("evidence") or []
    return None, []


def answer_question(frame: pd.DataFrame, question: str, history: list[dict[str, str]] | None = None) -> dict[str, Any]:
    frame = frame.copy()
    metrics = dataset_metrics(frame)
    text = " ".join(question.lower().strip().split())
    previous_answer, previous_evidence = _history_context(history)
    evidence: list[dict[str, Any]] = [_evidence("rows", metrics["rows"]), _evidence("columns", metrics["columns"])]

    if text in {"why", "why?", "explain the previous result", "can you explain the previous result"} or "previous result" in text:
        if previous_answer:
            return {
                "answer": f"The previous result was: {previous_answer} The figures were calculated from the current uploaded dataset; this does not prove causation without additional business context.",
                "evidence": previous_evidence or evidence,
            }
        return {"answer": "There is no previous analytical result in this conversation to explain.", "evidence": evidence}

    if "show the numbers" in text or text in {"numbers", "show numbers"}:
        if previous_evidence:
            return {"answer": "Here are the supporting values from the previous result: " + "; ".join(f"{item.get('metric')}: {item.get('value')}" for item in previous_evidence), "evidence": previous_evidence}
        return {"answer": "Ask a data question first and I will show the supporting values.", "evidence": evidence}

    if "missing" in text:
        value = metrics["missing_cells"]
        evidence.append(_evidence("missing_cells", value))
        return {"answer": f"There are {value:,} missing cells across {metrics['rows']:,} rows. This is a data-quality fact; the affected columns should be reviewed before using the results for decisions.", "evidence": evidence}

    if "duplicate" in text:
        value = metrics["duplicate_rows"]
        evidence.append(_evidence("duplicate_rows", value))
        return {"answer": f"I found {value:,} duplicate rows in the uploaded dataset. Remove or confirm them before interpreting totals if each row is expected to represent a unique record.", "evidence": evidence}

    if "column" in text or "field" in text or "schema" in text:
        fields = [str(column) for column in frame.columns]
        evidence.append(_evidence("fields", fields))
        return {"answer": "The uploaded dataset contains these fields: " + ", ".join(fields) + ".", "evidence": evidence}

    if ("best and worst month" in text or "best month" in text or "worst month" in text):
        date_column = _date_columns(frame)
        metric = _choose_metric(frame, text)
        if not date_column or not metric:
            return {"answer": "I need both a date column and a numeric measure to compare months.", "evidence": evidence}
        dates = pd.to_datetime(frame[date_column[0]], errors="coerce")
        values = pd.to_numeric(frame[metric], errors="coerce")
        grouped = frame.assign(_date=dates, _metric=values).dropna(subset=["_date", "_metric"]).groupby(frame.assign(_date=dates)["_date"].dt.to_period("M"))["_metric"].sum()
        if grouped.empty:
            return {"answer": "There are no valid monthly values to compare.", "evidence": evidence}
        best, worst = grouped.idxmax(), grouped.idxmin()
        evidence.append(_evidence("best_month", float(grouped.max()), period=str(best), numeric_column=metric))
        evidence.append(_evidence("worst_month", float(grouped.min()), period=str(worst), numeric_column=metric))
        return {"answer": f"{best} was the strongest month at {_money(grouped.max())}; {worst} was the weakest at {_money(grouped.min())}. This is a comparison, not proof of why the difference occurred.", "evidence": evidence}

    if "monthly" in text or "month" in text or "trend" in text:
        date_column = _date_columns(frame)
        metric = _choose_metric(frame, text)
        if not date_column or not metric:
            return {"answer": "I cannot calculate a monthly trend because the dataset needs a usable date column and a numeric measure such as sales or revenue.", "evidence": evidence}
        dates = pd.to_datetime(frame[date_column[0]], errors="coerce")
        series = pd.to_numeric(frame[metric], errors="coerce")
        trend = frame.assign(_date=dates, _metric=series).dropna(subset=["_date", "_metric"]).groupby(frame.assign(_date=dates)["_date"].dt.to_period("M"))["_metric"].sum()
        values = {str(period): float(value) for period, value in trend.items()}
        evidence.append(_evidence("monthly_totals", values, date_column=date_column[0], numeric_column=metric))
        if not values:
            return {"answer": "No valid dated numeric records were available for a monthly trend.", "evidence": evidence}
        return {"answer": f"Monthly {metric} totals are: " + ", ".join(f"{period}={_money(value)}" for period, value in values.items()) + ".", "evidence": evidence}

    if "average order value" in text or re.search(r"\baov\b", text):
        metric = _choose_metric(frame, "revenue")
        if not metric:
            return {"answer": "Average order value is unavailable because no revenue-like numeric column was detected.", "evidence": evidence}
        order_columns = _columns(frame, r"order.?id|transaction.?id")
        denominator = frame[order_columns[0]].nunique(dropna=True) if order_columns else len(frame)
        total = pd.to_numeric(frame[metric], errors="coerce").sum()
        value = float(total / denominator) if denominator else 0.0
        evidence.extend([_evidence("revenue_column", metric), _evidence("revenue_total", float(total)), _evidence("order_count", int(denominator))])
        return {"answer": f"Average order value is {_money(value)}, calculated as {_money(total)} of {metric} divided by {denominator:,} orders.", "evidence": evidence}

    if "low profitability" in text or "profitability" in text or "profit margin" in text:
        profit = _columns(frame, _METRIC_WORDS["profit"])
        revenue = _columns(frame, _METRIC_WORDS["revenue"])
        group = _choose_group(frame, text)
        if not profit or not revenue or not group:
            return {"answer": "Profitability analysis is unavailable because the dataset needs profit, revenue, and a grouping field.", "evidence": evidence}
        temp = pd.DataFrame({group: frame[group], "_profit": pd.to_numeric(frame[profit[0]], errors="coerce"), "_revenue": pd.to_numeric(frame[revenue[0]], errors="coerce")}).dropna()
        grouped = temp.groupby(group)[["_profit", "_revenue"]].sum()
        grouped["margin"] = grouped["_profit"] / grouped["_revenue"].replace(0, pd.NA) * 100
        grouped = grouped.dropna(subset=["margin"]).sort_values("margin")
        values = {str(index): float(row["margin"]) for index, row in grouped.head(5).iterrows()}
        evidence.append(_evidence("lowest_margins", values, group_column=group))
        return {"answer": f"The lowest observed profitability by {group} is: " + ", ".join(f"{key}={value:.2f}%" for key, value in values.items()) + ".", "evidence": evidence}

    if "opportunit" in text or "recommend three" in text or "improve revenue" in text:
        metric = _choose_metric(frame, "revenue")
        group = _choose_group(frame, text)
        if not metric or not group:
            return {"answer": "I cannot produce dataset-supported opportunities without a numeric business measure and a grouping field.", "evidence": evidence}
        grouped = frame.groupby(group)[metric].sum().sort_values(ascending=False)
        top = grouped.head(3)
        evidence.append(_evidence("top_opportunity_segments", {str(key): float(value) for key, value in top.items()}, group_column=group, numeric_column=metric))
        return {"answer": f"Three evidence-based actions are: protect availability for {top.index[0]} ({_money(top.iloc[0])} {metric}), investigate why lower-ranked segments trail it, and target promotions or retention work at the largest underperforming segments. These are recommendations based on contribution, not guaranteed causal outcomes.", "evidence": evidence}

    if "why did" in text and ("decrease" in text or "drop" in text or "declin" in text):
        metric = _choose_metric(frame, "revenue")
        dates = _date_columns(frame)
        if not metric or not dates:
            return {"answer": "I cannot investigate a decrease without a revenue-like numeric field and a date column.", "evidence": evidence}
        values = frame.assign(_date=pd.to_datetime(frame[dates[0]], errors="coerce"), _metric=pd.to_numeric(frame[metric], errors="coerce")).dropna(subset=["_date", "_metric"]).sort_values("_date")
        if len(values) < 2:
            return {"answer": "There are not enough dated observations to compare a decrease.", "evidence": evidence}
        first, last = float(values["_metric"].iloc[0]), float(values["_metric"].iloc[-1])
        change = last - first
        evidence.extend([_evidence("first_observation", first), _evidence("last_observation", last), _evidence("change", change)])
        return {"answer": f"{metric} changed from {_money(first)} to {_money(last)}, a change of {_money(change)}. The data shows the direction and size of the change, but does not prove the business cause; compare periods, products, regions, and pricing data next.", "evidence": evidence}

    if "overall business performance" in text or "overall performance" in text:
        numeric = _numeric_columns(frame)
        totals = {column: float(pd.to_numeric(frame[column], errors="coerce").sum()) for column in numeric}
        evidence.append(_evidence("numeric_totals", totals))
        return {"answer": f"Overall, the dataset contains {metrics['rows']:,} records and {metrics['columns']:,} fields. Numeric totals are: " + (", ".join(f"{key}={_money(value)}" for key, value in totals.items()) if totals else "not available") + f". Data quality includes {metrics['missing_cells']:,} missing cells and {metrics['duplicate_rows']:,} duplicates.", "evidence": evidence}

    if "compare" in text:
        metric = _choose_metric(frame, text)
        group = _choose_group(frame, text)
        if not metric or not group:
            return {"answer": "I need a numeric measure and grouping field to compare values.", "evidence": evidence}
        values = frame.groupby(group)[metric].sum()
        requested = [value for value in values.index if str(value).lower() in text]
        selected = values.loc[requested] if requested else values.sort_values(ascending=False).head(2)
        result = {str(key): float(value) for key, value in selected.items()}
        evidence.append(_evidence("comparison", result, group_column=group, numeric_column=metric))
        return {"answer": f"Using {metric} grouped by {group}: " + ", ".join(f"{key}={_money(value)}" for key, value in result.items()) + ".", "evidence": evidence}

    if "top five" in text or "top 5" in text or "highest" in text or "best" in text or "lowest" in text or "worst" in text or "most" in text or "contributes" in text:
        metric = _choose_metric(frame, text)
        group = _choose_group(frame, text)
        if not metric or not group:
            return {"answer": "I cannot rank results because the dataset does not contain both a numeric measure and a categorical grouping field.", "evidence": evidence}
        ascending = "lowest" in text or "worst" in text
        grouped = frame.groupby(group)[metric].sum().sort_values(ascending=ascending).head(5)
        values = {str(key): float(value) for key, value in grouped.items()}
        evidence.append(_evidence("ranked_values", values, group_column=group, numeric_column=metric, ascending=ascending))
        direction = "lowest" if ascending else "highest"
        return {"answer": f"The {direction} {metric} values by {group} are: " + ", ".join(f"{key}={_money(value)}" for key, value in values.items()) + ".", "evidence": evidence}

    if "total" in text or "sum" in text:
        metric = _choose_metric(frame, text)
        if not metric:
            return {"answer": "No numeric column is available for that total.", "evidence": evidence}
        value = float(pd.to_numeric(frame[metric], errors="coerce").sum())
        evidence.append(_evidence("total", value, numeric_column=metric))
        return {"answer": f"Total {metric} is {_money(value)}, calculated by summing the uploaded records.", "evidence": evidence}

    if "average" in text or "mean" in text:
        metric = _choose_metric(frame, text)
        if not metric:
            return {"answer": "No numeric column is available for that average.", "evidence": evidence}
        value = float(pd.to_numeric(frame[metric], errors="coerce").mean())
        evidence.append(_evidence("average", value, numeric_column=metric))
        return {"answer": f"Average {metric} is {_money(value)} ({metric}={_money(value)}), calculated across the uploaded records.", "evidence": evidence}

    return {"answer": "I could not map that question to a supported calculation. Ask about totals, rankings, comparisons, trends, averages, profitability, duplicates, missing values, or business opportunities.", "evidence": evidence}
