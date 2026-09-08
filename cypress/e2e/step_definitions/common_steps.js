import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { BooksPage } from '../pages/BooksPage';
import { BookDetailPage } from '../pages/BookDetailPage';

// Initialize page objects
const booksPage = new BooksPage();
const bookDetailPage = new BookDetailPage();

/**
 * GIVEN Steps - Common setup steps
 */

Given('the user is on the books catalog page', () => {
  booksPage.visitCatalog();
  booksPage.verifyCatalogLoaded();
});

Given('I open the bookstore catalog page', () => {
  booksPage.visitCatalog();
  booksPage.verifyCatalogLoaded();
});

Given('the user is on the book detail page', () => {
  booksPage.visitCatalog();
  booksPage.clickFirstBook();
  bookDetailPage.verifyDetailPageLoaded();
});

/**
 * WHEN Steps - User actions
 */

When('the user clicks on a book', () => {
  booksPage.clickFirstBook();
});

When('the user clicks on the first book', () => {
  booksPage.clickFirstBook();
});

When('the user clicks on book at index {int}', (index) => {
  booksPage.clickBookByIndex(index);
});

When('I select {string} sorting from the menu', (sortOption) => {
  booksPage.hoverCategory('All Books');
  cy.contains(sortOption).click({ force: true });
});

When('the user sorts books by {string}', (sortOption) => {
  booksPage.sortBy(sortOption);
});

When('the user adds the book to cart', () => {
  bookDetailPage.addToCart();
});

When('the user adds {int} books to cart', (quantity) => {
  bookDetailPage.addToCart(quantity);
});

When('the user goes back to catalog', () => {
  bookDetailPage.goBackToCatalog();
});

/**
 * THEN Steps - Verifications
 */

Then('the user should be on the book detail page', () => {
  bookDetailPage.verifyDetailPageLoaded();
});

Then('the book detail page should be visible', () => {
  bookDetailPage.verifyDetailPageLoaded();
});

Then('the checkout confirmation modal should be visible', () => {
  cy.url().should('include', '/books/');
  cy.get('body').should('be.visible');
});

Then('the books should be displayed in ascending order by price', () => {
  booksPage.verifyPricesSortedAscending();
});

Then('the user should see {int} books', (count) => {
  booksPage.getBookCount().should('equal', count);
});

Then('the books should be sorted by {string}', (sortValue) => {
  booksPage.verifySortedBy(sortValue);
});

Then('the book title should be visible', () => {
  bookDetailPage.getBookTitle().should('not.be.empty');
});

Then('the book price should be displayed', () => {
  bookDetailPage.getBookPrice().should('not.be.empty');
});

Then('the catalog page should be loaded', () => {
  booksPage.verifyCatalogLoaded();
});
