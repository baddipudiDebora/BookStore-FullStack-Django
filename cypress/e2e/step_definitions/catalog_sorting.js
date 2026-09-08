import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { BooksPage } from '../pages/BooksPage';

// Initialize page object
const booksPage = new BooksPage();

/**
 * Catalog Sorting Feature Steps
 * These steps are now simplified by using the BooksPage object
 */

Given("I open the bookstore catalog page", () => {
  booksPage.visitCatalog();
  booksPage.verifyCatalogLoaded();
});

When("I select {string} sorting from the menu", (sortOption) => {
  // Hover over category menu
  booksPage.hoverCategory('All Books');
  // Click the sorting option
  cy.contains(sortOption).click({ force: true });
  // Verify the URL includes sort parameter
  cy.url().should('include', 'sort=price');
  // Verify sort selector is set correctly
  booksPage.verifySortedBy('price_asc');
});

Then("the books should be displayed in ascending order by price", () => {
  booksPage.verifyPricesSortedAscending();
});
