import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given('the user is on the books catalog page', () => {
  cy.visit('/books/');
});

When('the user clicks on a non-existent promotional banner', () => {
  // Deliberately look for an element that does not exist to force a timeout failure
  cy.get('.non-existent-promo-banner', { timeout: 2000 }).click();
});

Then('the checkout confirmation modal should be visible', () => {
  cy.get('.checkout-modal').should('be.visible');
});