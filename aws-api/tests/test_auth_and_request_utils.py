import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SRC_PATH = str(REPO_ROOT / "aws-api" / "src")
if SRC_PATH not in sys.path:
    sys.path.insert(0, SRC_PATH)

from common.request_utils import BadRequestError, parse_json_body  # noqa: E402


class AwsApiHelpersTests(unittest.TestCase):
    def test_parse_json_body_raises_on_invalid_json(self):
        event = {"body": "{invalid", "isBase64Encoded": False}

        with self.assertRaises(BadRequestError):
            parse_json_body(event)


if __name__ == "__main__":
    unittest.main()
