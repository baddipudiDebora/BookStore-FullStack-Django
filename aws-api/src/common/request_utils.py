import base64
import json


class BadRequestError(Exception):
    pass


def get_http_method(event):
    return (
        event.get("requestContext", {}).get("http", {}).get("method")
        or event.get("httpMethod")
        or "GET"
    ).upper()


def get_path(event):
    return event.get("rawPath") or event.get("path", "")


def get_query_params(event):
    return event.get("queryStringParameters") or {}


def get_path_param(event, key):
    return (event.get("pathParameters") or {}).get(key)


def get_headers(event):
    headers = event.get("headers") or {}
    return {str(key).lower(): value for key, value in headers.items()}


def parse_json_body(event):
    body = event.get("body")
    if body in (None, ""):
        return {}

    if event.get("isBase64Encoded"):
        try:
            body = base64.b64decode(body, validate=True).decode("utf-8")
        except (TypeError, ValueError, UnicodeDecodeError) as exc:
            raise BadRequestError("Request body must be valid JSON.") from exc

    if isinstance(body, dict):
        return body

    try:
        return json.loads(body)
    except (TypeError, ValueError, json.JSONDecodeError) as exc:
        raise BadRequestError("Request body must be valid JSON.") from exc
