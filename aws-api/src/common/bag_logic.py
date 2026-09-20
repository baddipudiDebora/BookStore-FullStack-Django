import json
from decimal import Decimal

from django.conf import settings


def parse_bag_payload(event, fallback=None):
    headers = {str(k).lower(): v for k, v in (event.get("headers") or {}).items()}
    bag_header = headers.get("x-bag")
    if bag_header:
        try:
            payload = json.loads(bag_header)
            if isinstance(payload, dict):
                return payload
        except (TypeError, ValueError, json.JSONDecodeError):
            pass

    if isinstance(fallback, dict):
        return fallback

    return {}


def build_bag_contents(bag):
    from books.models import Book

    bag_items = []
    total = Decimal("0")
    book_count = 0

    for item_id, item_data in bag.items():
        try:
            book = Book.objects.get(pk=item_id)
        except Book.DoesNotExist:
            continue

        if isinstance(item_data, int):
            quantity = item_data
            total += quantity * book.price
            book_count += quantity
            bag_items.append(
                {
                    "item_id": str(item_id),
                    "quantity": quantity,
                    "book": book,
                }
            )
        elif isinstance(item_data, dict):
            for size, quantity in (item_data.get("items_by_size") or {}).items():
                total += quantity * book.price
                book_count += quantity
                bag_items.append(
                    {
                        "item_id": str(item_id),
                        "quantity": quantity,
                        "book": book,
                        "size": size,
                    }
                )

    if total < settings.FREE_DELIVERY_THRESHOLD:
        delivery = total * Decimal(settings.STANDARD_DELIVERY_PERCENTAGE / 100)
        free_delivery_delta = settings.FREE_DELIVERY_THRESHOLD - total
    else:
        delivery = Decimal("0")
        free_delivery_delta = Decimal("0")

    grand_total = delivery + total

    return {
        "bag_items": bag_items,
        "total": total,
        "book_count": book_count,
        "delivery": delivery,
        "free_delivery_delta": free_delivery_delta,
        "grand_total": grand_total,
    }
