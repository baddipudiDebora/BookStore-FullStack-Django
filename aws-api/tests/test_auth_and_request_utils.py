import sys
import unittest
import base64
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SRC_PATH = str(REPO_ROOT / "aws-api" / "src")
if SRC_PATH not in sys.path:
    sys.path.insert(0, SRC_PATH)

from common.request_utils import BadRequestError, parse_json_body  # noqa: E402


class AwsApiHelpersTests(unittest.TestCase):
    def test_parse_json_body_accepts_dict_body(self):
        event = {"body": {"name": "Book"}}
        self.assertEqual(parse_json_body(event), {"name": "Book"})

    def test_parse_json_body_decodes_base64(self):
        encoded = base64.b64encode(b'{\"name\": \"Book\"}').decode("utf-8")
        event = {"body": encoded, "isBase64Encoded": True}
        self.assertEqual(parse_json_body(event), {"name": "Book"})

    def test_parse_json_body_rejects_invalid_base64(self):
        event = {"body": "###", "isBase64Encoded": True}
        with self.assertRaises(BadRequestError):
            parse_json_body(event)

    def test_parse_json_body_rejects_invalid_utf8_after_base64_decode(self):
        encoded = base64.b64encode(bytes([255])).decode("utf-8")
        event = {"body": encoded, "isBase64Encoded": True}
        with self.assertRaises(BadRequestError):
            parse_json_body(event)

    def test_parse_json_body_rejects_non_json_after_base64_decode(self):
        encoded = base64.b64encode(b"not-json").decode("utf-8")
        event = {"body": encoded, "isBase64Encoded": True}
        with self.assertRaises(BadRequestError):
            parse_json_body(event)

    def test_parse_json_body_raises_on_invalid_json(self):
        event = {"body": "{invalid", "isBase64Encoded": False}

        with self.assertRaises(BadRequestError):
            parse_json_body(event)


if __name__ == "__main__":
    unittest.main()
