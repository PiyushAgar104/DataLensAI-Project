from __future__ import annotations

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import accuracy_score, f1_score, mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def train_model(frame: pd.DataFrame, task: str, target_column: str | None, test_size: float) -> dict:
    if task == "clustering":
        raise ValueError("Clustering is not enabled until a target-free clustering workflow is selected.")
    if not target_column or target_column not in frame.columns:
        raise ValueError("A valid target_column is required for supervised AutoML.")
    data = frame.dropna(subset=[target_column]).copy()
    if len(data) < 10:
        raise ValueError("At least ten labeled rows are required for AutoML.")
    X, y = data.drop(columns=[target_column]), data[target_column]
    numeric = X.select_dtypes(include="number").columns.tolist()
    categorical = [column for column in X.columns if column not in numeric]
    preprocessor = ColumnTransformer(
        transformers=[
            ("numeric", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scale", StandardScaler())]), numeric),
            ("categorical", Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("encode", OneHotEncoder(handle_unknown="ignore"))]), categorical),
        ],
        remainder="drop",
    )
    if task == "classification":
        if y.nunique() < 2:
            raise ValueError("Classification requires at least two target classes.")
        model = LogisticRegression(max_iter=1000)
    else:
        model = Ridge()
    pipeline = Pipeline([("preprocessor", preprocessor), ("model", model)])
    stratify = y if task == "classification" and y.value_counts().min() >= 2 else None
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42, stratify=stratify)
    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_test)
    if task == "classification":
        metrics = {"accuracy": round(float(accuracy_score(y_test, predictions)), 6), "f1": round(float(f1_score(y_test, predictions, average="weighted", zero_division=0)), 6)}
    else:
        metrics = {"mae": round(float(mean_absolute_error(y_test, predictions)), 6), "mse": round(float(mean_squared_error(y_test, predictions)), 6), "rmse": round(float(mean_squared_error(y_test, predictions) ** 0.5), 6), "r2": round(float(r2_score(y_test, predictions)), 6)}
    return {"task": task, "target_column": target_column, "rows_train": len(X_train), "rows_test": len(X_test), "metrics": metrics}
