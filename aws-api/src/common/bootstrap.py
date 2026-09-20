import os

import django
from django.apps import apps


def setup_django():
    """Initialize Django once per Lambda runtime."""
    if apps.ready:
        return

    os.environ.setdefault(
        "DJANGO_SETTINGS_MODULE",
        os.environ.get("AWS_DJANGO_SETTINGS_MODULE", "online_book.settings"),
    )
    django.setup()
