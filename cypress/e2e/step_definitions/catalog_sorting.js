import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I open the bookstore catalog page", () => {
  cy.visit('/books/');
  cy.get('body').should('be.visible');
});

When("I select {string} sorting from the menu", (sortOption) => {
  cy.contains('All Books').trigger('mouseover');
  cy.contains(sortOption).click({ force: true });
  cy.url().should('include', 'sort=price');
  cy.get('#sort-selector').should('have.value', 'price_asc');
});

// Notice the lowercase "the" here matching the feature file exactly
Then("the books should be displayed in ascending order by price", () => {
  cy.get('.book-container .card').then($cards => {
    const prices = [];
    $cards.each((index, card) => {
      const text = Cypress.$(card).find('.font-weight-bold').text();
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
});