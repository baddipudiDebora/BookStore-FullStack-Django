import { BasePage } from './BasePage';

/**
 * Books Catalog Page Object
 * Contains selectors and methods specific to the books catalog page
 */
export class BooksPage extends BasePage {
  // Selectors
  selectors = {
    booksHeader: 'h2.logo-font',
    sortSelector: '#sort-selector',
    bookCard: '.card',
    bookContainer: '.book-container',
    bookLink: 'a[href*="/books/"]',
    categoryBadge: '.category-badge',
    priceText: '.font-weight-bold',
    ratingText: '.fa-star',
    bookImage: '.card-img-top',
    backToTopButton: '.btt-button'
  };

  /**
   * Navigate to books catalog page
   */
  visitCatalog() {
    this.visit('/books/');
  }

  /**
   * Get all book cards
   */
  getBookCards() {
    return cy.get(`${this.selectors.bookContainer} ${this.selectors.bookCard}`);
  }

  /**
   * Click on first book card
   */
  clickFirstBook() {
    cy.get(this.selectors.bookCard).first().find('a').first().click();
  }

  /**
   * Click on a specific book by index
   */
  clickBookByIndex(index) {
    cy.get(this.selectors.bookCard).eq(index).find('a').first().click();
  }

  /**
   * Sort books by option
   */
  sortBy(sortOption) {
    cy.get(this.selectors.sortSelector).select(sortOption);
  }

  /**
   * Get all book prices
   */
  getBookPrices() {
    const prices = [];
    return cy.get(`${this.selectors.bookContainer} ${this.selectors.priceText}`).each(($price) => {
      const text = $price.text();
      const match = text.match(/\$([0-9]+\.[0-9]{2})/);
      if (match) {
        prices.push(parseFloat(match[1]));
      }
    }).then(() => prices);
  }

  /**
   * Verify books are sorted by price ascending
   */
  verifyPricesSortedAscending() {
    cy.get(`${this.selectors.bookContainer} ${this.selectors.bookCard}`).then(($cards) => {
      const prices = [];
      $cards.each((index, card) => {
        const text = Cypress.$(card).find(this.selectors.priceText).text();
        const match = text.match(/\$([0-9]+\.[0-9]{2})/);
        if (match) {
          prices.push(parseFloat(match[1]));
        }
      });

      expect(prices.length).to.be.greaterThan(1);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).to.be.at.most(prices[i + 1]);
      }
    });
  }

  /**
   * Verify catalog page is loaded
   */
  verifyCatalogLoaded() {
    this.verifyElementVisible(this.selectors.booksHeader);
    this.verifyElementVisible(this.selectors.bookContainer);
  }

  /**
   * Get number of books displayed
   */
  getBookCount() {
    return cy.get(`${this.selectors.bookContainer} ${this.selectors.bookCard}`).its('length');
  }

  /**
   * Verify sort selector has specific value
   */
  verifySortedBy(value) {
    cy.get(this.selectors.sortSelector).should('have.value', value);
  }

  /**
   * Hover over category
   */
  hoverCategory(categoryName) {
    cy.contains(categoryName).trigger('mouseover');
  }

  /**
   * Click category link
   */
  clickCategory(categoryName) {
    cy.contains(categoryName).click({ force: true });
  }
}
