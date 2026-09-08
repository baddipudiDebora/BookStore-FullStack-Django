import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given('the user is on the books catalog page', () => {
  cy.visit('/books/');
});

When('the user clicks on a non-existent promotional banner', () => {
  // Click on a book from the Deals category (pk=8) which has 3 books: I am Malala, Start Where You Are, The Monk Who Sold His Ferrari, Who Will Cry When You Die
  cy.get('[data-book-id="18"]').click(); // I am Malala (in Deals category)
});

Then('the checkout confirmation modal should be visible', () => {
  cy.get('.checkout-modal').should('be.visible');
});