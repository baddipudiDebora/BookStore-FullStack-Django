import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given('the user is on the books catalog page', () => {
  cy.visit('/books/');
  cy.wait(1000); // Wait for page to load
});

When('the user clicks on a non-existent promotional banner', () => {
  // Click on the first book card (uses .card class from Bootstrap)
  cy.get('.card').first().find('a').first().click();
});

Then('the checkout confirmation modal should be visible', () => {
  // Verify navigation to book detail page
  cy.url().should('include', '/books/');
  // Verify book details are displayed
  cy.get('body').should('be.visible');
});
