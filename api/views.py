import json

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.core.exceptions import ValidationError
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.db.models.functions import Lower
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from bag.contexts import bag_contents
from books.forms import BookForm
from books.models import Book, Category
from checkout.models import Order, OrderLineItem


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
    if request.method == 'POST':
        if not request.user.is_authenticated or not request.user.is_superuser:
            return JsonResponse({'detail': 'Superuser access required.'}, status=403)

        try:
            payload = json.loads(request.body)
        except (TypeError, json.JSONDecodeError):
            return JsonResponse({'detail': 'Request body must be valid JSON.'}, status=400)

        form = BookForm(payload)
        if not form.is_valid():
            return JsonResponse({'errors': form.errors.get_json_data()}, status=400)

        book = form.save()
        return JsonResponse(serialize_book(book), status=201)

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

    if request.method == 'PATCH':
        if not request.user.is_authenticated or not request.user.is_superuser:
            return JsonResponse({'detail': 'Superuser access required.'}, status=403)
        try:
            payload = json.loads(request.body)
        except (TypeError, json.JSONDecodeError):
            return JsonResponse({'detail': 'Request body must be valid JSON.'}, status=400)
        current_values = {
            field.name: getattr(book, field.name)
            for field in Book._meta.fields
            if field.name not in ('id', 'image')
        }
        current_values.update(payload)
        form = BookForm(current_values, instance=book)
        if not form.is_valid():
            return JsonResponse({'errors': form.errors.get_json_data()}, status=400)
        return JsonResponse(serialize_book(form.save()))

    if request.method == 'DELETE':
        if not request.user.is_authenticated or not request.user.is_superuser:
            return JsonResponse({'detail': 'Superuser access required.'}, status=403)
        book.delete()
        return JsonResponse({}, status=204)

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


def register(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'POST required.'}, status=405)
    try:
        payload = json.loads(request.body)
    except (TypeError, json.JSONDecodeError):
        return JsonResponse({'detail': 'Request body must be valid JSON.'}, status=400)

    required_fields = ('username', 'email', 'password')
    missing = [field for field in required_fields if not payload.get(field)]
    if missing:
        return JsonResponse({'errors': {field: ['This field is required.'] for field in missing}}, status=400)
    User = get_user_model()
    if User.objects.filter(username=payload['username']).exists():
        return JsonResponse({'errors': {'username': ['A user with that username already exists.']}}, status=400)
    user = User.objects.create_user(
        username=payload['username'],
        email=payload['email'],
        password=payload['password'],
    )
    return JsonResponse({'id': user.id, 'username': user.username, 'email': user.email}, status=201)


def user_login(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'POST required.'}, status=405)
    try:
        payload = json.loads(request.body)
    except (TypeError, json.JSONDecodeError):
        return JsonResponse({'detail': 'Request body must be valid JSON.'}, status=400)
    user = authenticate(request, username=payload.get('username'), password=payload.get('password'))
    if user is None:
        return JsonResponse({'detail': 'Invalid credentials.'}, status=401)
    login(request, user)
    return JsonResponse({'id': user.id, 'username': user.username, 'email': user.email})


@login_required
def user_logout(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'POST required.'}, status=405)
    logout(request)
    return JsonResponse({}, status=204)


def checkout_api(request):
    if request.method == 'GET':
        contents = bag_contents(request)
        return JsonResponse({
            'book_count': contents['book_count'],
            'total': str(contents['total']),
            'delivery': str(contents['delivery']),
            'grand_total': str(contents['grand_total']),
        })
    if request.method != 'POST':
        return JsonResponse({'detail': 'GET or POST required.'}, status=405)

    bag = request.session.get('bag', {})
    if not bag:
        return JsonResponse({'detail': 'Shopping bag is empty.'}, status=400)
    try:
        payload = json.loads(request.body)
    except (TypeError, json.JSONDecodeError):
        return JsonResponse({'detail': 'Request body must be valid JSON.'}, status=400)

    order_fields = {
        field.name: payload.get(field.name)
        for field in Order._meta.fields
        if field.name in {
            'full_name', 'email', 'phone_number', 'country', 'postcode',
            'town_or_city', 'street_address1', 'street_address2', 'county',
        }
    }
    order = Order(**order_fields)
    order.order_number = order._generate_order_number()
    order.original_bag = json.dumps(bag)
    order.stripe_pid = payload.get('stripe_pid', 'api')
    try:
        order.full_clean()
    except ValidationError as error:
        return JsonResponse({'errors': error.message_dict}, status=400)
    order.save()
    for item_id, item_data in bag.items():
        book = get_object_or_404(Book, pk=item_id)
        if isinstance(item_data, int):
            OrderLineItem.objects.create(order=order, book=book, quantity=item_data)
        else:
            for size, quantity in item_data['items_by_size'].items():
                OrderLineItem.objects.create(order=order, book=book, quantity=quantity, book_size=size)
    order.update_total()
    del request.session['bag']
    return JsonResponse({
        'order_number': order.order_number,
        'grand_total': str(order.grand_total),
    }, status=201)


def admin_orders(request):
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({'detail': 'Superuser access required.'}, status=403)
    return JsonResponse({
        'results': [
            {
                'order_number': order.order_number,
                'email': order.email,
                'grand_total': str(order.grand_total),
                'date': order.date.isoformat(),
            }
            for order in Order.objects.order_by('-date')
        ],
    })
