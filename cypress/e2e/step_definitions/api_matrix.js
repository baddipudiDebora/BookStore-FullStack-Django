import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

let registeredUser;
let apiResponse;

When('I register a unique API user', () => {
  registeredUser = {
    username: `api_user_${Date.now()}`,
    email: `api_${Date.now()}@example.com`,
    password: 'Strong-password-123',
  };
  cy.request({
    method: 'POST',
    url: '/api/v1/auth/register/',
    body: registeredUser,
    failOnStatusCode: false,
  }).then((response) => {
    apiResponse = response;
  });
});

When('I log in with the registered API user', () => {
  cy.request({
    method: 'POST',
    url: '/api/v1/auth/login/',
    body: {
      username: registeredUser.username,
      password: registeredUser.password,
    },
    failOnStatusCode: false,
  }).then((response) => {
    apiResponse = response;
  });
});

When('I request checkout totals from the API', () => {
  cy.request('/api/v1/checkout/').then((response) => {
    apiResponse = response;
  });
});

When('I send an unauthorized PATCH request for a book', () => {
  cy.request({
    method: 'PATCH',
    url: '/api/v1/books/1/',
    body: { name: 'Unauthorized update' },
    failOnStatusCode: false,
  }).then((response) => {
    apiResponse = response;
  });
});

When('I send an unauthorized DELETE request for a book', () => {
  cy.request({
    method: 'DELETE',
    url: '/api/v1/books/1/',
    failOnStatusCode: false,
  }).then((response) => {
    apiResponse = response;
  });
});

When('I request admin orders without a superuser session', () => {
  cy.request({
    url: '/api/v1/admin/orders/',
    failOnStatusCode: false,
  }).then((response) => {
    apiResponse = response;
  });
});

Then('the registration API response status should be {int}', (statusCode) => {
  cy.then(() => expect(apiResponse.status).to.equal(statusCode));
});

Then('the login API response status should be {int}', (statusCode) => {
  cy.then(() => expect(apiResponse.status).to.equal(statusCode));
});

Then('the checkout API response status should be {int}', (statusCode) => {
  cy.then(() => expect(apiResponse.status).to.equal(statusCode));
});

Then('the protected API response status should be {int}', (statusCode) => {
  cy.then(() => expect(apiResponse.status).to.equal(statusCode));
});

Then('the checkout API response should contain a grand total', () => {
  cy.then(() => expect(apiResponse.body).to.have.property('grand_total'));
});
