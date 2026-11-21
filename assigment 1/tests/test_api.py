import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    init_db()


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_posts" in data
    assert "posts_24h" in data
    assert "us_posts" in data
    assert "total_recruiters" in data
    assert "valid_emails" in data


def test_system_status():
    response = client.get("/api/system/status")
    assert response.status_code == 200
    data = response.json()
    assert "database_status" in data
    assert "linkedin_mode" in data
    assert "gmail_mode" in data


def test_search_and_history():
    # 1. Trigger search pipeline for specific keyword
    search_res = client.post("/api/search/start", json={
        "keywords": ["Java Developer C2C"]
    })
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["status"] == "SUCCESS"
    assert search_data["search_summary"]["total_posts_found"] > 0

    # 2. Check search history
    hist_res = client.get("/api/search/history")
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert len(hist_data) > 0


def test_posts_endpoints():
    response = client.get("/api/posts?limit=10")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_recruiters_endpoints():
    response = client.get("/api/recruiters")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_settings_get_and_put():
    # GET settings
    get_res = client.get("/api/settings")
    assert get_res.status_code == 200
    settings = get_res.json()
    assert "company_name" in settings

    # PUT settings
    put_res = client.put("/api/settings", json={
        "company_name": "Test Company Inc.",
        "search_frequency_minutes": "30"
    })
    assert put_res.status_code == 200
    assert "company_name" in put_res.json()["updated_keys"]

