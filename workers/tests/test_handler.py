import json
import unittest
from pathlib import Path

from handler import handler


class TestHandler(unittest.TestCase):
    def test_processes_valid_document_sent_event(self):
        fixture_path = (
            Path(__file__).parent / "fixtures" / "document-sent.json"
        )
        document_event = json.loads(fixture_path.read_text())

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

        result = handler(lambda_event, None)

        self.assertEqual(result["statusCode"], 200)
        self.assertEqual(result["processed_count"], 1)