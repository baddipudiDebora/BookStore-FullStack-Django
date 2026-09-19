from django.db.models import Q
from django.db.models.functions import Lower
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from bag.contexts import bag_contents
from books.models import Book, Category


BOOK_SORT_FIELDS = {
    'name': 'lower_name',
    'category': 'category__name',
    'price': 'price',
    'rating': 'rating',
}


def serialize_book(book):
    return {
        'id': book.id,
        'sku': book.sku,
        'name': book.name,
        'description': book.description,
        'category': book.category.name if book.category else None,
        'has_sizes': book.has_sizes,
        'price': str(book.price),
        'rating': str(book.rating) if book.rating is not None else None,
        'image_url': book.image_url,
        'image': book.image.url if book.image else None,
    }


def books(request):
    queryset = Book.objects.select_related('category').all()
    query = request.GET.get('q')
    category_names = request.GET.get('category')
    sort = request.GET.get('sort')
    direction = request.GET.get('direction')

    if query:
        queryset = queryset.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )

    if category_names:
        queryset = queryset.filter(
            category__name__in=category_names.split(',')
        )

    if sort in BOOK_SORT_FIELDS:
        sort_field = BOOK_SORT_FIELDS[sort]
        if sort == 'name':
            queryset = queryset.annotate(lower_name=Lower('name'))
        if direction == 'desc':
            sort_field = f'-{sort_field}'
        queryset = queryset.order_by(sort_field)

    return JsonResponse({
        'count': queryset.count(),
        'results': [serialize_book(book) for book in queryset],
    })


def book_detail(request, book_id):
    book = get_object_or_404(
        Book.objects.select_related('category'),
        pk=book_id,
    )
    return JsonResponse(serialize_book(book))


def categories(request):
    return JsonResponse({
        'results': [
            {
                'id': category.id,
                'name': category.name,
                'friendly_name': category.friendly_name,
            }
            for category in Category.objects.all()
        ],
    })


def bag(request):
    contents = bag_contents(request)
    return JsonResponse({
        'items': [
            {
                'book_id': item['item_id'],
                'quantity': item['quantity'],
                'size': item.get('size'),
                'book': serialize_book(item['book']),
            }
            for item in contents['bag_items']
        ],
        'total': str(contents['total']),
        'book_count': contents['book_count'],
        'delivery': str(contents['delivery']),
        'free_delivery_delta': str(contents['free_delivery_delta']),
        'grand_total': str(contents['grand_total']),
    })
