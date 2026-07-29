import unittest

from shared.textract import extract_document_text


class FakeTextractClient:
    def __init__(self, response):
        self.response = response
        self.request = None

    def detect_document_text(self, **kwargs):
        self.request = kwargs
        return self.response


class TestExtractDocumentText(unittest.TestCase):
    def test_extracts_line_blocks_from_s3_document(self):
        client = FakeTextractClient(
            {
                "Blocks": [
                    {
                        "BlockType": "PAGE",
                        "Id": "page-1",
                    },
                    {
                        "BlockType": "LINE",
                        "Text": "Synthetic lab result",
                    },
                    {
                        "BlockType": "WORD",
                        "Text": "Synthetic",
                    },
                    {
                        "BlockType": "LINE",
                        "Text": "Hemoglobin: 11.2",
                    },
                ]
            }
        )

        result = extract_document_text(
            bucket="test-document-bucket",
            key="synthetic/lab-result.png",
            client=client,
        )

        self.assertEqual(
            result,
            "Synthetic lab result\nHemoglobin: 11.2",
        )
        self.assertEqual(
            client.request,
            {
                "Document": {
                    "S3Object": {
                        "Bucket": "test-document-bucket",
                        "Name": "synthetic/lab-result.png",
                    }
                }
            },
        )

    def test_rejects_empty_s3_location(self):
        client = FakeTextractClient({"Blocks": []})

        with self.assertRaises(ValueError):
            extract_document_text(
                bucket="",
                key="synthetic/document.png",
                client=client,
            )

    def test_rejects_response_without_text_lines(self):
        client = FakeTextractClient(
            {
                "Blocks": [
                    {
                        "BlockType": "PAGE",
                        "Id": "page-1",
                    }
                ]
            }
        )

        with self.assertRaises(ValueError):
            extract_document_text(
                bucket="test-document-bucket",
                key="synthetic/blank-document.png",
                client=client,
            )


if __name__ == "__main__":
    unittest.main()