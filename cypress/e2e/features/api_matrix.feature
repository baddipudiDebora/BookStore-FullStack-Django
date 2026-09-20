Feature: Shift-left API coverage
  As an API consumer
  I want the documented API contracts to be executable
  So that authentication and protected workflows fail fast

  Scenario: Protect registration writes with CSRF validation
    When I register a unique API user
    Then the registration API response status should be 403

  Scenario: Read checkout totals from the API
    When I request checkout totals from the API
    Then the checkout API response status should be 200
    And the checkout API response should contain a grand total

  Scenario: Reject protected catalog and order operations
    When I send an unauthorized PATCH request for a book
    Then the protected API response status should be 403
    When I send an unauthorized DELETE request for a book
    Then the protected API response status should be 403
    When I request admin orders without a superuser session
    Then the protected API response status should be 403
