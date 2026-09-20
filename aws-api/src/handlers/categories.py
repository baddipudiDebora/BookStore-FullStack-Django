from common.bootstrap import setup_django
from common.response import json_response


def handler(_event, _context):
    setup_django()

    from books.models import Category

    return json_response(
        200,
        {
            "results": [
                {
                    "id": category.id,
                    "name": category.name,
                    "friendly_name": category.friendly_name,
                }
                for category in Category.objects.all()
            ]
        },
    )
