import json
import unittest

from shared.secrets import get_internal_api_key


class FakeSecretsManagerClient:
    def __init__(self, response):
        self.response = response
        self.secret_id = None

    def get_secret_value(self, *, SecretId):
        self.secret_id = SecretId
        return self.response


class GetInternalApiKeyTests(unittest.TestCase):
    def test_reads_api_key_from_secret_json(self):
        client = FakeSecretsManagerClient(
            {
                "SecretString": json.dumps(
                    {"AI_INTERNAL_API_KEY": "test-api-key"}
                )
            }
        )

        result = get_internal_api_key(
            "arn:aws:secretsmanager:us-east-2:123456789012:secret:test",
            client=client,
        )

        self.assertEqual(result, "test-api-key")
        self.assertEqual(
            client.secret_id,
            "arn:aws:secretsmanager:us-east-2:123456789012:secret:test",
        )

    def test_rejects_empty_secret_arn(self):
        with self.assertRaisesRegex(
            ValueError,
            "secret_arn must not be empty",
        ):
            get_internal_api_key(" ")

    def test_rejects_missing_secret_string(self):
        client = FakeSecretsManagerClient({})

        with self.assertRaisesRegex(
            ValueError,
            "SecretString is missing",
        ):
            get_internal_api_key("test-secret", client=client)

    def test_rejects_missing_api_key(self):
        client = FakeSecretsManagerClient(
            {"SecretString": json.dumps({"OTHER_KEY": "value"})}
        )

        with self.assertRaisesRegex(
            ValueError,
            "AI_INTERNAL_API_KEY is missing",
        ):
            get_internal_api_key("test-secret", client=client)


if __name__ == "__main__":
    unittest.main()