from common.bag_logic import build_bag_contents, parse_bag_payload
from common.bootstrap import setup_django
from common.response import json_response
from common.serializers import serialize_book


def handler(event, _context):
    setup_django()
    bag = parse_bag_payload(event)
    contents = build_bag_contents(bag)

    return json_response(
        200,
        {
            "items": [
                {
                    "book_id": item["item_id"],
                    "quantity": item["quantity"],
                    "size": item.get("size"),
                    "book": serialize_book(item["book"]),
                }
                for item in contents["bag_items"]
            ],
            "total": str(contents["total"]),
            "book_count": contents["book_count"],
            "delivery": str(contents["delivery"]),
            "free_delivery_delta": str(contents["free_delivery_delta"]),
            "grand_total": str(contents["grand_total"]),
        },
    )
