from decimal import Decimal

from django.test import TestCase

from books.models import Book, Category


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
