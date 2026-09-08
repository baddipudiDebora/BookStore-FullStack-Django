import { BasePage } from './BasePage';

/**
 * Book Detail Page Object
 * Contains selectors and methods specific to individual book detail page
 */
export class BookDetailPage extends BasePage {
  // Selectors
  selectors = {
    bookTitle: '.product-details-left h4',
    bookPrice: '.product-details-left .lead',
    bookDescription: '.product-details-left p',
    bookRating: '.product-details-left .fa-star',
    addToCartButton: '.add-to-cart-btn',
    quantityInput: 'input[name="quantity"]',
    categoryLink: '.category-link',
    backLink: '.back-link',
    productImage: '.product-image-main'
  };

  /**
   * Verify book detail page is loaded
   */
  verifyDetailPageLoaded() {
    this.verifyElementVisible(this.selectors.bookTitle);
    this.verifyElementVisible(this.selectors.bookPrice);
  }

  /**
   * Get book title
   */
  getBookTitle() {
    return this.getElementText(this.selectors.bookTitle);
  }

  /**
   * Get book price
   */
  getBookPrice() {
    return this.getElementText(this.selectors.bookPrice);
  }

  /**
   * Get book rating
   */
  getBookRating() {
    return this.getElementText(this.selectors.bookRating);
  }

  /**
   * Add book to cart with quantity
   */
  addToCart(quantity = 1) {
    if (quantity > 1) {
      cy.get(this.selectors.quantityInput).clear().type(quantity);
    }
    this.clickElement(this.selectors.addToCartButton);
  }

  /**
   * Go back to catalog
   */
  goBackToCatalog() {
    this.clickElement(this.selectors.backLink);
  }

  /**
   * Click on category from book detail
   */
  clickCategoryLink() {
    this.clickElement(this.selectors.categoryLink);
  }
}
