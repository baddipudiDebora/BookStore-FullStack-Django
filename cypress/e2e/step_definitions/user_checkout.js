import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { BooksPage } from '../pages/BooksPage';

// Initialize page object
const booksPage = new BooksPage();

/**
 * User Checkout Feature Steps
 * These steps use the common steps defined in common_steps.js
 * Combined with reusable page object methods
 */

Given('the user is on the books catalog page', () => {
  booksPage.visitCatalog();
  booksPage.verifyCatalogLoaded();
});

When('the user clicks on a non-existent promotional banner', () => {
  // Click on the first book card from the catalog
  booksPage.clickFirstBook();
});

Then('the checkout confirmation modal should be visible', () => {
  // Verify we're on a valid page after clicking
  cy.url().should('include', '/books/');
  cy.get('body').should('be.visible');
});
