from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DataLensAI API"
    allowed_origins: str = "http://localhost:5173,http://localhost:5174"
    max_upload_bytes: int = 50 * 1024 * 1024
    dataset_ttl_seconds: int = 3600
    llm_api_key: str | None = None
    llm_model: str | None = None
    admin_token: str | None = None
    merchant_upi_id: str | None = None
    database_path: str = "backend/data/datalensai.sqlite3"
    payment_screenshot_dir: str = "backend/data/payment_screenshots"
    admin_session_ttl_seconds: int = 3600

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


settings = Settings()
