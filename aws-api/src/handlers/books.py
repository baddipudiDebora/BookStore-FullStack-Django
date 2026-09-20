from django.db.models import Q
from django.db.models.functions import Lower

from common.auth import UnauthorizedError, require_superuser
from common.bootstrap import setup_django
from common.request_utils import (
    BadRequestError,
    get_http_method,
    get_path_param,
    get_query_params,
    parse_json_body,
)
from common.response import json_response
from common.serializers import serialize_book

BOOK_SORT_FIELDS = {
    "name": "lower_name",
    "category": "category__name",
    "price": "price",
    "rating": "rating",
}


def handler(event, _context):
    setup_django()

    from books.forms import BookForm
    from books.models import Book

    method = get_http_method(event)
    book_id = get_path_param(event, "book_id")

    if method == "GET" and book_id:
        try:
            book = Book.objects.select_related("category").get(pk=book_id)
        except Book.DoesNotExist:
            return json_response(404, {"detail": "Not found."})
        return json_response(200, serialize_book(book))

    if method == "GET":
        query = get_query_params(event)
        queryset = Book.objects.select_related("category").all()

        if query.get("q"):
            queryset = queryset.filter(
                Q(name__icontains=query["q"]) | Q(description__icontains=query["q"])
            )

        category_names = query.get("category")
        if category_names:
            queryset = queryset.filter(category__name__in=category_names.split(","))

        sort = query.get("sort")
        direction = query.get("direction")
        if sort in BOOK_SORT_FIELDS:
            sort_field = BOOK_SORT_FIELDS[sort]
            if sort == "name":
                queryset = queryset.annotate(lower_name=Lower("name"))
            if direction == "desc":
                sort_field = f"-{sort_field}"
            queryset = queryset.order_by(sort_field)

        return json_response(
            200,
            {
                "count": queryset.count(),
                "results": [serialize_book(book) for book in queryset],
            },
        )

    if method == "POST":
        try:
            require_superuser(event)
        except UnauthorizedError as exc:
            status = 403 if "Superuser" in str(exc) else 401
            return json_response(status, {"detail": str(exc)})

        try:
            payload = parse_json_body(event)
        except BadRequestError as exc:
            return json_response(400, {"detail": str(exc)})

        form = BookForm(payload)
        if not form.is_valid():
            return json_response(400, {"errors": form.errors.get_json_data()})

        return json_response(201, serialize_book(form.save()))

    return json_response(405, {"detail": "Method not allowed."})
