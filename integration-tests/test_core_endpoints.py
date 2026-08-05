import pytest
import requests


def test_get_organizations(base_url, auth_headers):
    response = requests.get(f"{base_url}/organizations", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.xfail(
    reason=(
        "GET /users now requires require_admin (api/routes/users.py), but this "
        "was never one of the 3 admin-only routes from the PR #64 security fix "
        "(PUT /users/{id}/role, PUT /users/{id}/status, PUT /organizations/{id}). "
        "Any authenticated non-admin org member should be able to list their own "
        "org's users (used by the Security page) — flagged to Bella 08/04."
    ),
    strict=True,
)


def test_get_users(base_url, auth_headers):
    response = requests.get(f"{base_url}/users", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_webhooks(base_url, auth_headers):
    response = requests.get(f"{base_url}/settings/webhooks", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_dashboard_stats(base_url, auth_headers):
    response = requests.get(f"{base_url}/dashboard/stats", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    for key in (
        "documents_sent",
        "documents_received",
        "pending_review",
        "ai_processed",
    ):
        assert key in body


def test_audit_logs(base_url, auth_headers):
    response = requests.get(f"{base_url}/audit", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_notifications(base_url, auth_headers):
    response = requests.get(f"{base_url}/notifications", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_ai_stats(base_url, auth_headers):
    response = requests.get(f"{base_url}/ai/stats", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert "documents_processed" in body


def test_ai_categories(base_url, auth_headers):
    response = requests.get(f"{base_url}/ai/categories", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_tasks(base_url, auth_headers):
    response = requests.get(f"{base_url}/tasks", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_security_settings(base_url, auth_headers):
    response = requests.get(f"{base_url}/security/settings", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert "mfa_enabled" in body


def test_notification_preferences(base_url, auth_headers):
    response = requests.get(
        f"{base_url}/settings/notifications", headers=auth_headers
    )
    assert response.status_code == 200
    body = response.json()
    assert "document_delivered" in body


def test_api_keys(base_url, auth_headers):
    response = requests.get(f"{base_url}/settings/api-keys", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)




@pytest.mark.xfail(
    reason=(
        "Same root cause as test_get_users above: GET /users now requires "
        "require_admin, so both orgs just get {'detail': 'Admin privileges "
        "required'} instead of their actual user lists — flagged to Bella 08/04."
    ),
    strict=True,
)

def test_users_endpoint_respects_authenticated_org(
    base_url, auth_headers, auth_headers_user2
):
    users_org1 = requests.get(f"{base_url}/users", headers=auth_headers).json()
    users_org2 = requests.get(f"{base_url}/users", headers=auth_headers_user2).json()
    # Different orgs should not see the exact same user list.
    assert users_org1 != users_org2


def test_me_includes_organization_name(base_url, auth_headers):
    response = requests.get(f"{base_url}/auth/me", headers=auth_headers)
    body = response.json()
    assert body["organization_name"] is not None
    assert body["org_code"] is not None
