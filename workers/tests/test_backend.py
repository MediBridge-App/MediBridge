import json
import unittest

from shared.backend import save_analysis


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class SaveAnalysisTests(unittest.TestCase):
    def test_posts_analysis_to_backend(self):
        captured = {}

        def fake_opener(request, timeout):
            captured["request"] = request
            captured["timeout"] = timeout
            return FakeResponse({"document_id": "document-123"})

        payload = {
            "document_id": "document-123",
            "document_type": "lab_result",
            "summary": "Lab results require review.",
        }

        result = save_analysis(
            payload,
            base_url="https://app.medibridge.click/",
            api_key="test-api-key",
            opener=fake_opener,
        )

        request = captured["request"]

        self.assertEqual(
            request.full_url,
            "https://app.medibridge.click/internal/ai/analyses",
        )
        self.assertEqual(request.get_method(), "POST")
        self.assertEqual(
            json.loads(request.data.decode("utf-8")),
            payload,
        )
        self.assertEqual(
            request.get_header("Content-type"),
            "application/json",
        )
        self.assertEqual(
            request.get_header("X-api-key"),
            "test-api-key",
        )
        self.assertEqual(captured["timeout"], 10)
        self.assertEqual(result, {"document_id": "document-123"})

    def test_rejects_empty_base_url(self):
        with self.assertRaisesRegex(
            ValueError,
            "base_url must not be empty",
        ):
            save_analysis(
                {"document_id": "document-123"},
                base_url=" ",
                api_key="test-api-key",
            )

    def test_rejects_empty_api_key(self):
        with self.assertRaisesRegex(
            ValueError,
            "api_key must not be empty",
        ):
            save_analysis(
                {"document_id": "document-123"},
                base_url="https://app.medibridge.click",
                api_key=" ",
            )


if __name__ == "__main__":
    unittest.main()
