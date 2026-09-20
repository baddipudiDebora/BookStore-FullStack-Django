import json

from django.core.exceptions import ValidationError

from common.bag_logic import build_bag_contents, parse_bag_payload
from common.bootstrap import setup_django
from common.request_utils import BadRequestError, get_http_method, parse_json_body
from common.response import json_response


ORDER_FIELDS = {
    "full_name",
    "email",
    "phone_number",
    "country",
    "postcode",
    "town_or_city",
    "street_address1",
    "street_address2",
    "county",
}


def handler(event, _context):
    setup_django()

    from books.models import Book
    from checkout.models import Order, OrderLineItem

    method = get_http_method(event)

    if method == "GET":
        contents = build_bag_contents(parse_bag_payload(event))
        return json_response(
            200,
            {
                "book_count": contents["book_count"],
                "total": str(contents["total"]),
                "delivery": str(contents["delivery"]),
                "grand_total": str(contents["grand_total"]),
            },
        )

    if method != "POST":
        return json_response(405, {"detail": "GET or POST required."})

    try:
        payload = parse_json_body(event)
    except BadRequestError as exc:
        return json_response(400, {"detail": str(exc)})

    bag = parse_bag_payload(event, fallback=payload.get("bag"))
    if not bag:
        return json_response(400, {"detail": "Shopping bag is empty."})

    order_fields = {key: payload.get(key) for key in ORDER_FIELDS}
    order = Order(**order_fields)
    order.order_number = order._generate_order_number()
    order.original_bag = json.dumps(bag)
    order.stripe_pid = payload.get("stripe_pid", "api")

    try:
        order.full_clean()
    except ValidationError as error:
        return json_response(400, {"errors": error.message_dict})

    order.save()

    for item_id, item_data in bag.items():
        try:
            book = Book.objects.get(pk=item_id)
        except Book.DoesNotExist:
            return json_response(400, {"detail": f"Book {item_id} not found."})

        if isinstance(item_data, int):
            OrderLineItem.objects.create(order=order, book=book, quantity=item_data)
        else:
            for size, quantity in (item_data.get("items_by_size") or {}).items():
                OrderLineItem.objects.create(
                    order=order,
                    book=book,
                    quantity=quantity,
                    book_size=size,
                )

    order.update_total()
    return json_response(
        201,
        {
            "order_number": order.order_number,
            "grand_total": str(order.grand_total),
        },
    )
