from common.auth import UnauthorizedError, require_superuser
from common.bootstrap import setup_django
from common.response import json_response


def handler(event, _context):
    setup_django()

    from checkout.models import Order

    try:
        require_superuser(event)
    except UnauthorizedError as exc:
        status = 403 if "Superuser" in str(exc) else 401
        return json_response(status, {"detail": str(exc)})

    return json_response(
        200,
        {
            "results": [
                {
                    "order_number": order.order_number,
                    "email": order.email,
                    "grand_total": str(order.grand_total),
                    "date": order.date.isoformat(),
                }
                for order in Order.objects.order_by("-date")
            ]
        },
    )
