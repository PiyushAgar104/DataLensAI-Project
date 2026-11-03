from fastapi.testclient import TestClient

from app.main import app
from app.config import settings


client = TestClient(app)


def test_upload_profiles_actual_values():
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("sales.csv", b"category,amount,date\nA,10,2024-01-01\nB,20,2024-01-02\nA,30,2024-01-03\n", "text/csv")},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["rows"] == 3
    assert payload["numeric_summaries"]["amount"]["sum"] == 60
    assert payload["categorical_summaries"]["category"][0]["label"] == "A"


def test_chat_uses_uploaded_dataset():
    upload = client.post("/api/datasets/upload", files={"file": ("data.csv", b"x,y\n1,2\n3,4\n", "text/csv")})
    dataset_id = upload.json()["dataset_id"]
    response = client.post(f"/api/datasets/{dataset_id}/chat", json={"question": "What is the average?"})
    assert response.status_code == 200
    assert "x=" in response.json()["answer"]


def test_repeated_uploads_are_isolated_and_grouped_insights_are_fresh():
    dataset_a = b"Product,Category,Sales\nLaptop,Electronics,50000\nMobile,Electronics,30000\nChair,Furniture,10000\n"
    dataset_b = b"Employee,Department,Salary\nAmit,IT,25000\nRahul,HR,40000\nPriya,Finance,60000\n"

    upload_a = client.post("/api/datasets/upload", files={"file": ("a.csv", dataset_a, "text/csv")})
    upload_b = client.post("/api/datasets/upload", files={"file": ("b.csv", dataset_b, "text/csv")})
    upload_a_again = client.post("/api/datasets/upload", files={"file": ("a-again.csv", dataset_a, "text/csv")})

    assert upload_a.status_code == upload_b.status_code == upload_a_again.status_code == 200
    profile_a = upload_a.json()
    profile_b = upload_b.json()
    profile_a_again = upload_a_again.json()

    assert len({profile_a["dataset_id"], profile_b["dataset_id"], profile_a_again["dataset_id"]}) == 3
    assert profile_a["columns"][0]["name"] == "Product"
    assert profile_a["grouped_summaries"]["Product"]["Sales"][0]["label"] == "Laptop"
    assert profile_a["grouped_summaries"]["Category"]["Sales"][0]["label"] == "Electronics"
    assert profile_b["columns"][0]["name"] == "Employee"
    assert profile_b["grouped_summaries"]["Employee"]["Salary"][0]["label"] == "Priya"
    assert "Laptop" not in str(profile_b)
    assert "Sales" not in profile_b["numeric_summaries"]
    assert profile_a_again["grouped_summaries"]["Product"]["Sales"][0]["label"] == "Laptop"
    assert upload_b.headers["cache-control"].startswith("no-store")


def test_receipt_requires_verification_and_is_generated_once(monkeypatch):
    monkeypatch.setattr(settings, "admin_token", "test-admin-token")
    payment = client.post(
        "/api/payments",
        data={"plan_name": "Pro Terminal", "amount": "$49", "billing_duration": "Monthly"},
    )
    assert payment.status_code == 200
    reference = payment.json()["reference"]

    pending_status = client.get(f"/api/payments/{reference}/status")
    assert pending_status.json() == {"status": "PENDING", "receipt_number": None}
    assert client.get(f"/api/payments/{reference}/receipt").status_code == 409

    login = client.post("/api/admin/login", data={"admin_password": "test-admin-token"})
    assert login.status_code == 200
    approved = client.post(f"/api/admin/payments/{reference}/approve")
    assert approved.status_code == 200
    receipt_number = approved.json()["receipt_number"]
    assert receipt_number

    verified_status = client.get(f"/api/payments/{reference}/status").json()
    assert verified_status == {"status": "PAID", "receipt_number": receipt_number}
    receipt = client.get(f"/api/payments/{reference}/receipt")
    assert receipt.status_code == 200
    assert receipt_number.encode() in receipt.content
    assert client.post(f"/api/admin/payments/{reference}/approve").status_code == 409


def test_rejected_payment_has_no_receipt_or_acknowledgement(monkeypatch):
    monkeypatch.setattr(settings, "admin_token", "test-admin-token")
    payment = client.post(
        "/api/payments",
        data={"plan_name": "Business Vault", "amount": "$199", "billing_duration": "Monthly"},
    )
    reference = payment.json()["reference"]
    client.post("/api/admin/login", data={"admin_password": "test-admin-token"})
    rejected = client.post(f"/api/admin/payments/{reference}/reject")
    assert rejected.status_code == 200
    assert rejected.json()["receipt_number"] is None
    assert client.get(f"/api/payments/{reference}/receipt").status_code == 409
