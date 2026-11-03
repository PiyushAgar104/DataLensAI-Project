from typing import Any, Literal

from pydantic import BaseModel, Field


class ColumnProfile(BaseModel):
    name: str
    type: Literal["numeric", "categorical", "datetime", "boolean", "text"]
    sample: Any = None
    missing: int
    missing_pct: float
    unique: int


class DatasetProfile(BaseModel):
    dataset_id: str
    name: str
    rows: int
    columns_count: int
    quality_score: float
    duplicate_rows: int
    missing_cells: int
    columns: list[ColumnProfile]
    numeric_summaries: dict[str, dict[str, float | int | None]]
    categorical_summaries: dict[str, list[dict[str, Any]]]
    grouped_summaries: dict[str, dict[str, list[dict[str, Any]]]]
    time_series: list[dict[str, Any]]
    correlation: dict[str, dict[str, float]]
    preview: list[dict[str, Any]]
    warnings: list[str] = Field(default_factory=list)
    insights: list[dict[str, Any]] = Field(default_factory=list)
    business_metrics: dict[str, Any] = Field(default_factory=dict)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1000)
    history: list[dict[str, Any]] = Field(default_factory=list, max_length=20)


class ChatResponse(BaseModel):
    answer: str
    evidence: list[dict[str, Any]] = Field(default_factory=list)


class ForecastRequest(BaseModel):
    date_column: str | None = None
    target_column: str | None = None
    periods: int = Field(default=6, ge=1, le=52)


class AutoMLRequest(BaseModel):
    task: Literal["classification", "regression", "clustering"]
    target_column: str | None = None
    test_size: float = Field(default=0.2, ge=0.1, le=0.4)
