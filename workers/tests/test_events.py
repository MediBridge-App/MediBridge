import json
import unittest
from pathlib import Path

from jsonschema import ValidationError
from shared.events import (
    parse_sns_message,
    validate_document_analysis,
    validate_document_sent,
)


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

    def test_validates_document_sent_event(self):
        fixture_path = (
            Path(__file__).parent / "fixtures" / "document-sent.json"
        )
        event = json.loads(fixture_path.read_text())

        validated_event = validate_document_sent(event)

        self.assertEqual(validated_event, event)

    def test_rejects_event_missing_required_field(self):
        fixture_path = (
            Path(__file__).parent / "fixtures" / "document-sent.json"
        )
        event = json.loads(fixture_path.read_text())
        event.pop("document_id")
        with self.assertRaises(ValidationError):
            validate_document_sent(event)

class TestValidateDocumentAnalysis(unittest.TestCase):
    def setUp(self):
        fixture_path = (
            Path(__file__).parent
            / "fixtures"
            / "document-analysis.json"
        )
        self.analysis = json.loads(
            fixture_path.read_text(encoding="utf-8")
        )

    def test_validates_document_analysis(self):
        validated_analysis = validate_document_analysis(self.analysis)

        self.assertEqual(validated_analysis, self.analysis)
        self.assertEqual(
            validated_analysis["document_type"],
            "lab_result",
        )

    def test_rejects_analysis_missing_required_field(self):
        self.analysis.pop("summary")

        with self.assertRaises(ValidationError):
            validate_document_analysis(self.analysis)

    def test_rejects_confidence_above_100(self):
        self.analysis["confidence_score"] = 101

        with self.assertRaises(ValidationError):
            validate_document_analysis(self.analysis)

if __name__ == "__main__":
    unittest.main()