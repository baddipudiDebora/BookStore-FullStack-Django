from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from books.models import Book, Category
from checkout.models import Order


class BookApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        category = Category.objects.create(name='Reference')
        cls.book = Book.objects.create(
            category=category,
            name='Django Testing',
            description='A guide to testing Django applications.',
            price=Decimal('12.50'),
        )

    def test_books_endpoint_supports_search_and_serializes_prices(self):
        response = self.client.get('/api/v1/books/?q=testing')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(response.json()['results'][0]['price'], '12.50')

    def test_book_detail_endpoint_returns_book(self):
        response = self.client.get(f'/api/v1/books/{self.book.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['id'], self.book.id)

    def test_bag_endpoint_reads_the_existing_session_bag(self):
        session = self.client.session
        session['bag'] = {str(self.book.id): 2}
        session.save()

        response = self.client.get('/api/v1/bag/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['book_count'], 2)
        self.assertEqual(response.json()['items'][0]['book_id'], str(self.book.id))

    def test_books_endpoint_allows_superusers_to_create_books(self):
        user = get_user_model().objects.create_superuser(
            username='store-owner',
            email='owner@example.com',
            password='test-password',
        )
        self.client.force_login(user)

        response = self.client.post(
            '/api/v1/books/',
            data={
                'category': self.book.category_id,
                'sku': 'API-001',
                'name': 'API Book',
                'description': 'Created through the bookstore API.',
                'price': '18.99',
            },
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['name'], 'API Book')
        self.assertTrue(Book.objects.filter(sku='API-001').exists())

    def test_books_endpoint_rejects_non_superusers(self):
        user = get_user_model().objects.create_user(
            username='customer',
            password='test-password',
        )
        self.client.force_login(user)

        response = self.client.post(
            '/api/v1/books/',
            data={'name': 'Unauthorized Book'},
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 403)

    def test_register_login_and_logout_endpoints(self):
        register_response = self.client.post(
            '/api/v1/auth/register/',
            data={'username': 'api-user', 'email': 'api@example.com', 'password': 'strong-password'},
            content_type='application/json',
        )
        self.assertEqual(register_response.status_code, 201)

        login_response = self.client.post(
            '/api/v1/auth/login/',
            data={'username': 'api-user', 'password': 'strong-password'},
            content_type='application/json',
        )
        self.assertEqual(login_response.status_code, 200)

        logout_response = self.client.post('/api/v1/auth/logout/')
        self.assertEqual(logout_response.status_code, 204)

    def test_superuser_can_patch_and_delete_a_book(self):
        user = get_user_model().objects.create_superuser(
            username='catalog-owner',
            email='catalog@example.com',
            password='test-password',
        )
        self.client.force_login(user)

        patch_response = self.client.patch(
            f'/api/v1/books/{self.book.id}/',
            data={'name': 'Updated API Book', 'price': '21.00'},
            content_type='application/json',
        )
        self.assertEqual(patch_response.status_code, 200)
        self.assertEqual(patch_response.json()['name'], 'Updated API Book')

        delete_response = self.client.delete(f'/api/v1/books/{self.book.id}/')
        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(Book.objects.filter(id=self.book.id).exists())

    def test_checkout_get_and_post_use_the_session_bag(self):
        session = self.client.session
        session['bag'] = {str(self.book.id): 1}
        session.save()

        get_response = self.client.get('/api/v1/checkout/')
        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(get_response.json()['book_count'], 1)

        post_response = self.client.post(
            '/api/v1/checkout/',
            data={
                'full_name': 'API Buyer',
                'email': 'buyer@example.com',
                'phone_number': '5551234',
                'country': 'US',
                'postcode': '12345',
                'town_or_city': 'Test City',
                'street_address1': '1 Test Street',
                'street_address2': '',
                'county': '',
            },
            content_type='application/json',
        )
        self.assertEqual(post_response.status_code, 201)
        self.assertEqual(Order.objects.count(), 1)
        self.assertNotIn('bag', self.client.session)

    def test_admin_orders_endpoint_requires_superuser_and_lists_orders(self):
        response = self.client.get('/api/v1/admin/orders/')
        self.assertEqual(response.status_code, 403)

        user = get_user_model().objects.create_superuser(
            username='orders-owner',
            email='orders@example.com',
            password='test-password',
        )
        self.client.force_login(user)
        response = self.client.get('/api/v1/admin/orders/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['results'], [])
