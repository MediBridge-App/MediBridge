import json
import unittest
from pathlib import Path
from unittest import mock

from shared.bedrock import analyze_document_text


class FakeBedrockClient:
    def __init__(self, response_text):
        self.response_text = response_text
        self.request = None

    def converse(self, **kwargs):
        self.request = kwargs

        return {
            "output": {
                "message": {
                    "content": [
                        {
                            "text": self.response_text,
                        }
                    ]
                }
            }
        }


class TestAnalyzeDocumentText(unittest.TestCase):
    def setUp(self):
        fixture_path = (
            Path(__file__).parent
            / "fixtures"
            / "document-analysis.json"
        )
        self.analysis = json.loads(
            fixture_path.read_text(encoding="utf-8")
        )

    def test_returns_validated_analysis_with_measured_processing_time(self):
        client = FakeBedrockClient(json.dumps(self.analysis))

        with mock.patch(
            "shared.bedrock.time.perf_counter",
            side_effect=[10.0, 10.25],
        ):
            result = analyze_document_text(
                "Synthetic CBC document text.",
                client=client,
                model_id="test-model",
            )

        expected = dict(self.analysis)
        expected["processing_time_ms"] = 250

        self.assertEqual(result, expected)
        self.assertEqual(client.request["modelId"], "test-model")
        self.assertEqual(
            client.request["inferenceConfig"]["temperature"],
            0,
        )

    def test_rejects_empty_document_text(self):
        client = FakeBedrockClient(json.dumps(self.analysis))

        with self.assertRaises(ValueError):
            analyze_document_text(
                "   ",
                client=client,
                model_id="test-model",
            )

    def test_rejects_non_json_model_response(self):
        client = FakeBedrockClient("This is not JSON.")

        with self.assertRaises(json.JSONDecodeError):
            analyze_document_text(
                "Synthetic referral document text.",
                client=client,
                model_id="test-model",
            )


if __name__ == "__main__":
    unittest.main()