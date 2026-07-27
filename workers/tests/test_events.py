import json
import unittest
from pathlib import Path

from workers.shared.events import parse_sns_message


class TestParseSnsMessage(unittest.TestCase):
    def test_parses_document_sent_event(self):
        fixture_path = (
            Path(__file__).parent / "fixtures" / "document-sent.json"
        )

        document_event = json.loads(
            fixture_path.read_text(encoding="utf-8")
        )

        sns_envelope = {
            "Message": json.dumps(document_event)
        }

        sqs_record = {
            "body": json.dumps(sns_envelope)
        }

        result = parse_sns_message(sqs_record)

        self.assertEqual(result, document_event)
        self.assertEqual(result["event_type"], "document.sent")


if __name__ == "__main__":
    unittest.main()