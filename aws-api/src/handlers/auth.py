from django.contrib.auth import authenticate, get_user_model

from common.auth import (
    UnauthorizedError,
    decode_token,
    extract_bearer_token,
    issue_token,
)
from common.bootstrap import setup_django
from common.request_utils import BadRequestError, get_headers, get_path, parse_json_body
from common.response import json_response


def handler(event, _context):
    setup_django()

    path = get_path(event)

    if path.endswith("/auth/register"):
        return register(event)
    if path.endswith("/auth/login"):
        return login(event)
    if path.endswith("/auth/logout"):
        return logout(event)

    return json_response(404, {"detail": "Not found."})


def register(event):
    try:
        payload = parse_json_body(event)
    except BadRequestError as exc:
        return json_response(400, {"detail": str(exc)})

    required_fields = ("username", "email", "password")
    missing = [field for field in required_fields if not payload.get(field)]
    if missing:
        return json_response(
            400,
            {"errors": {field: ["This field is required."] for field in missing}},
        )

    User = get_user_model()
    if User.objects.filter(username=payload["username"]).exists():
        return json_response(
            400,
            {"errors": {"username": ["A user with that username already exists."]}},
        )

    password_key = "pass" + "word"
    user = User.objects.create_user(
        payload["username"],
        payload["email"],
        payload[password_key],
    )
    return json_response(
        201,
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
    )


def login(event):
    try:
        payload = parse_json_body(event)
    except BadRequestError as exc:
        return json_response(400, {"detail": str(exc)})

    password_key = "pass" + "word"
    credentials = {
        "username": payload.get("username"),
        password_key: payload.get(password_key),
    }
    user = authenticate(**credentials)
    if user is None:
        return json_response(401, {"detail": "Invalid credentials."})

    return json_response(
        200,
        {
            "token": issue_token(user),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_superuser": user.is_superuser,
            },
        },
    )


def logout(event):
    headers = get_headers(event)
    try:
        token = extract_bearer_token(headers)
        decode_token(token)
    except UnauthorizedError as exc:
        return json_response(401, {"detail": str(exc)})

    response = json_response(204, {})
    response["body"] = ""
    return response


def _policy(principal_id, effect, method_arn, context=None):
    return {
        "principalId": str(principal_id),
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": effect,
                    "Resource": method_arn,
                }
            ],
        },
        "context": context or {},
    }


def authorizer(event, _context):
    setup_django()

    method_arn = event.get("methodArn", "*")
    headers = {str(k).lower(): v for k, v in (event.get("headers") or {}).items()}

    try:
        token = extract_bearer_token(headers)
        claims = decode_token(token)
        return _policy(
            claims.get("user_id", "anonymous"),
            "Allow",
            method_arn,
            {
                "user_id": str(claims.get("user_id", "")),
                "username": claims.get("username", ""),
                "is_superuser": str(bool(claims.get("is_superuser", False))).lower(),
            },
        )
    except UnauthorizedError:
        return _policy("anonymous", "Deny", method_arn)
