def serialize_book(book):
    return {
        "id": book.id,
        "sku": book.sku,
        "name": book.name,
        "description": book.description,
        "category": book.category.name if book.category else None,
        "has_sizes": book.has_sizes,
        "price": str(book.price),
        "rating": str(book.rating) if book.rating is not None else None,
        "image_url": book.image_url,
        "image": book.image.url if book.image else None,
    }
