# AWS API (API Gateway + Lambda)

This directory contains a SAM application that migrates the Django JSON API surface to API Gateway + Lambda.

## Architecture choice

The Lambda handlers bootstrap Django (`online_book.settings`) so existing models/forms/validation can be reused with minimal risk.

- API Gateway routes `/v1/*` requests to resource-specific Lambda handlers.
- Lambda handlers return API Gateway proxy-compatible JSON responses.
- Database connectivity comes from `DATABASE_URL` environment configuration.
- Auth is token-based (signed bearer token from `/v1/auth/login`) with a Lambda authorizer.

## Files

- `template.yaml` — SAM infrastructure with API + Lambda resources
- `openapi.yaml` — OpenAPI 3.0 spec for all v1 endpoints
- `src/handlers/` — endpoint handlers grouped by resource
- `src/common/` — shared bootstrap/auth/request/serialization logic
- `docs/swagger-ui/index.html` — static Swagger UI page for local browsing

## Local commands

```bash
cd aws-api
sam validate
sam build
sam deploy --guided
```

To view docs locally:

```bash
python -m http.server 8000
# then open http://localhost:8000/aws-api/docs/swagger-ui/
```

To validate OpenAPI (best effort):

```bash
npx @apidevtools/swagger-cli validate aws-api/openapi.yaml
```
