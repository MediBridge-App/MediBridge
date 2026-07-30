import json
import unittest
from pathlib import Path

from handler import handler


class FakeTextractClient:
    def __init__(self):
        self.request = None

    def detect_document_text(self, **kwargs):
        self.request = kwargs

        return {
            "Blocks": [
                {
                    "BlockType": "LINE",
                    "Text": "Synthetic lab result",
                },
                {
                    "BlockType": "LINE",
                    "Text": "Hemoglobin: 11.2",
                },
            ]
        }


class FakeBedrockClient:
    def __init__(self, analysis):
        self.analysis = analysis
        self.request = None

    def converse(self, **kwargs):
        self.request = kwargs

        return {
            "output": {
                "message": {
                    "content": [
                        {
                            "text": json.dumps(self.analysis),
                        }
                    ]
                }
            }
        }


class TestHandler(unittest.TestCase):
    def test_processes_document_with_textract_and_bedrock(self):
        fixture_directory = Path(__file__).parent / "fixtures"

        document_event = json.loads(
            (fixture_directory / "document-sent.json").read_text(
                encoding="utf-8"
            )
        )
        expected_analysis = json.loads(
            (fixture_directory / "document-analysis.json").read_text(
                encoding="utf-8"
            )
        )

        lambda_event = {
            "Records": [
                {
                    "body": json.dumps(
                        {
                            "Message": json.dumps(document_event),
                        }
                    )
                }
            ]
        }

        textract_client = FakeTextractClient()
        bedrock_client = FakeBedrockClient(expected_analysis)

        result = handler(
            lambda_event,
            None,
            textract_client=textract_client,
            bedrock_client=bedrock_client,
            model_id="test-model",
        )

        self.assertEqual(result["statusCode"], 200)
        self.assertEqual(result["processed_count"], 1)
        self.assertEqual(result["analyses"], [expected_analysis])

        self.assertEqual(
            textract_client.request["Document"]["S3Object"],
            {
                "Bucket": document_event["s3_bucket"],
                "Name": document_event["s3_key"],
            },
        )
        self.assertEqual(
            bedrock_client.request["modelId"],
            "test-model",
        )
        self.assertEqual(
            bedrock_client.request["messages"][0]["content"][0]["text"],
            "Synthetic lab result\nHemoglobin: 11.2",
        )


if __name__ == "__main__":
    unittest.main()