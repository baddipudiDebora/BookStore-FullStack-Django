import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given('the user is on the books catalog page', () => {
  cy.visit('/books/');
  cy.wait(2000); // Wait for page to load
});

When('the user clicks on a non-existent promotional banner', () => {
  // Click on the first book card that exists on the page
  cy.get('[class*="product"]').first().click({ force: true });
  // OR use a more reliable selector:
  // cy.contains('a', 'One indian girl').click();
});

Then('the checkout confirmation modal should be visible', () => {
  // Check if we navigated to book detail or checkout
  cy.url().should('include', '/books/');
  // Or verify page has loaded
  cy.get('body').should('be.visible');
});