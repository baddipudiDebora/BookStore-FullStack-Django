from django.urls import path

from . import views


urlpatterns = [
    path('books/', views.books, name='api_books'),
    path('books/<int:book_id>/', views.book_detail, name='api_book_detail'),
    path('categories/', views.categories, name='api_categories'),
    path('bag/', views.bag, name='api_bag'),
]
