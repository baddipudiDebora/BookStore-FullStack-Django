import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

let postResponse;

When('I send an unauthenticated POST request to the books API endpoint', () => {
  cy.request({
    method: 'POST',
    url: '/api/v1/books/',
    body: {
      name: 'Unauthenticated API Book',
      description: 'This request should be rejected.',
      price: '10.00',
    },
    failOnStatusCode: false,
  }).then((response) => {
    postResponse = response;
  });
});

Then('the POST API response status should be {int}', (statusCode) => {
  cy.then(() => {
    expect(postResponse.status).to.equal(statusCode);
  });
});

Then('the POST API response should require superuser access', () => {
  cy.then(() => {
    const responseBody = typeof postResponse.body === 'string'
      ? JSON.parse(postResponse.body)
      : postResponse.body;
    expect(responseBody.detail).to.equal('Superuser access required.');
  });
});
