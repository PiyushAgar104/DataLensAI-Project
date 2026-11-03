from __future__ import annotations

from typing import Any

import pandas as pd

from app.services.profiling import _clean_frame, _json_value


def dataset_metrics(frame: pd.DataFrame) -> dict[str, Any]:
    frame = _clean_frame(frame)
    numeric = frame.select_dtypes(include="number")
    return {
        "rows": int(frame.shape[0]),
        "columns": int(frame.shape[1]),
        "missing_cells": int(frame.isna().sum().sum()),
        "duplicate_rows": int(frame.duplicated().sum()),
        "numeric_means": {str(column): _json_value(value) for column, value in numeric.mean().items()},
        "numeric_totals": {str(column): _json_value(value) for column, value in numeric.sum().items()},
        "categorical_counts": {
            str(column): [{"label": _json_value(label), "count": int(count)} for label, count in frame[column].value_counts(dropna=True).head(20).items()]
            for column in frame.select_dtypes(exclude="number").columns
        },
    }
