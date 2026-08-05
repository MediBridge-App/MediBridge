import os
import requests


def test_login_returns_tokens(base_url):
    email = os.getenv("DEMO_USER_1_EMAIL")
    password = os.getenv("DEMO_USER_1_PASSWORD")

    response = requests.post(
        f"{base_url}/auth/login",
        json={"email": email, "password": password},
    )

    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert "id_token" in body
    assert "refresh_token" in body
    assert body["user"]["email"] == email


def test_login_invalid_password_returns_401(base_url):
    response = requests.post(
        f"{base_url}/auth/login",
        json={
            "email": os.getenv("DEMO_USER_1_EMAIL"),
            "password": "definitely-wrong-password",
        },
    )
    assert response.status_code == 401


def test_me_returns_current_user(base_url, auth_headers):
    # Unlike /auth/login (which wraps the user under a "user" key alongside
    # the tokens), /auth/me returns the user fields flat at the top level —
    # see api/routes/auth.py::get_me.
    response = requests.get(f"{base_url}/auth/me", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["email"] == os.getenv("DEMO_USER_1_EMAIL")


def test_me_without_token_is_rejected(base_url):
    response = requests.get(f"{base_url}/auth/me")
    assert response.status_code in (401, 403)


def test_logout(base_url, auth_headers):
    response = requests.post(f"{base_url}/auth/logout", headers=auth_headers)
    assert response.status_code == 200
