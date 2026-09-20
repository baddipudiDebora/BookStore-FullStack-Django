from django.urls import path

from . import views


urlpatterns = [
    path('books/', views.books, name='api_books'),
    path('books/<int:book_id>/', views.book_detail, name='api_book_detail'),
    path('categories/', views.categories, name='api_categories'),
    path('bag/', views.bag, name='api_bag'),
    path('auth/register/', views.register, name='api_register'),
    path('auth/login/', views.user_login, name='api_login'),
    path('auth/logout/', views.user_logout, name='api_logout'),
    path('checkout/', views.checkout_api, name='api_checkout'),
    path('admin/orders/', views.admin_orders, name='api_admin_orders'),
]
