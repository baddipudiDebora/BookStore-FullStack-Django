import os

from django.contrib.auth import get_user_model
from django.core import signing

TOKEN_SALT = "bookstore-aws-api-token"


class UnauthorizedError(Exception):
    pass


def issue_token(user):
    payload = {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "is_superuser": bool(user.is_superuser),
    }
    return signing.dumps(payload, salt=TOKEN_SALT, compress=True)


def get_token_ttl_seconds():
    return int(os.environ.get("AWS_API_TOKEN_TTL_SECONDS", "86400"))


def decode_token(token):
    try:
        return signing.loads(token, salt=TOKEN_SALT, max_age=get_token_ttl_seconds())
    except signing.BadSignature as exc:
        raise UnauthorizedError("Invalid or expired token.") from exc


def extract_bearer_token(headers):
    authorization = headers.get("authorization", "")
    if not authorization.lower().startswith("bearer "):
        raise UnauthorizedError("Authorization bearer token is required.")
    return authorization.split(" ", 1)[1].strip()


def get_user_from_event(event):
    request_context = event.get("requestContext") or {}
    authorizer_data = request_context.get("authorizer") or {}
    lambda_ctx = authorizer_data.get("lambda")

    if isinstance(lambda_ctx, dict) and lambda_ctx.get("user_id"):
        user_id = lambda_ctx["user_id"]
    else:
        headers = {str(k).lower(): v for k, v in (event.get("headers") or {}).items()}
        token = extract_bearer_token(headers)
        claims = decode_token(token)
        user_id = claims.get("user_id")

    User = get_user_model()
    try:
        return User.objects.get(pk=user_id)
    except User.DoesNotExist as exc:
        raise UnauthorizedError("User not found.") from exc


def require_superuser(event):
    user = get_user_from_event(event)
    if not user.is_superuser:
        raise UnauthorizedError("Superuser access required.")
    return user
