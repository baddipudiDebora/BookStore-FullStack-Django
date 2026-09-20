import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

let lastResponse;
let booksResponse;

When('I send a GET request to the books API endpoint', () => {
  cy.request('/api/v1/books/').then((response) => {
    booksResponse = response;
    lastResponse = response;
  });
});

When('I send a GET request for the first returned book', () => {
  cy.then(() => {
    const firstBook = booksResponse.body.results[0];
    expect(firstBook, 'books API should return at least one book').to.exist;

    return cy.request(`/api/v1/books/${firstBook.id}/`).then((response) => {
      lastResponse = response;
    });
  });
});

When('I send a GET request to the categories API endpoint', () => {
  cy.request('/api/v1/categories/').then((response) => {
    lastResponse = response;
  });
});

When('I send a GET request to the bag API endpoint', () => {
  cy.request('/api/v1/bag/').then((response) => {
    lastResponse = response;
  });
});

Then('the API response status should be {int}', (statusCode) => {
  cy.then(() => {
    expect(lastResponse.status).to.equal(statusCode);
  });
});

Then('the API response should contain a results array', () => {
  cy.then(() => {
    expect(lastResponse.body.results).to.be.an('array');
  });
});

Then('the API response should contain the first book ID', () => {
  cy.then(() => {
    expect(lastResponse.body.id).to.equal(booksResponse.body.results[0].id);
  });
});

Then('the API response should contain a book count', () => {
  cy.then(() => {
    expect(lastResponse.body).to.have.property('book_count');
    expect(lastResponse.body.book_count).to.be.a('number');
  });
});
