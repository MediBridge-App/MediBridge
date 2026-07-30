import os
import pytest
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")


def login(email: str, password: str) -> dict:
    """Logs in against the real backend (which itself talks to real Cognito)
    and returns the full token response."""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password},
        timeout=10,
    )
    assert response.status_code == 200, (
        f"Login failed for {email}: {response.status_code} {response.text}"
    )
    return response.json()


@pytest.fixture(scope="session")
def base_url() -> str:
    return BASE_URL


@pytest.fixture(scope="session")
def user1_token() -> str:
    """Primary demo user: j.rivera@stmercy.org (organization a0000000-...-001)."""
    email = os.getenv("DEMO_USER_1_EMAIL")
    password = os.getenv("DEMO_USER_1_PASSWORD")
    assert password, "Set DEMO_USER_1_PASSWORD in your .env before running tests"
    return login(email, password)["access_token"]


@pytest.fixture(scope="session")
def user2_token() -> str:
    """Second demo user, used for cross-organization scenarios
    (e.g. confirming a document actually reaches its recipient org)."""
    email = os.getenv("DEMO_USER_2_EMAIL")
    password = os.getenv("DEMO_USER_2_PASSWORD")
    assert password, "Set DEMO_USER_2_PASSWORD in your .env before running tests"
    return login(email, password)["access_token"]


@pytest.fixture
def auth_headers(user1_token) -> dict:
    return {"Authorization": f"Bearer {user1_token}"}


@pytest.fixture
def auth_headers_user2(user2_token) -> dict:
    return {"Authorization": f"Bearer {user2_token}"}
