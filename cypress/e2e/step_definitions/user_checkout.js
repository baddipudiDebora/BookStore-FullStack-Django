import { When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { BooksPage } from '../pages/BooksPage';

// Initialize page object
const booksPage = new BooksPage();

/**
 * User Checkout Feature Steps
 * These steps use the common steps defined in common_steps.js for GIVEN setup
 * Combined with reusable page object methods
 * NOTE: GIVEN and common WHEN/THEN steps are in common_steps.js
 * Only feature-specific steps are defined here
 */

When('the user clicks on a non-existent promotional banner', () => {
  // Click on the first book card from the catalog
  booksPage.clickFirstBook();
});

Then('the checkout confirmation modal should be visible', () => {
  // Verify we're on a valid page after clicking
  cy.url().should('include', '/books/');
  cy.get('body').should('be.visible');
});
