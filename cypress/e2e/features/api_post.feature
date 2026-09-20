Feature: Bookstore API POST endpoints
  As an API consumer
  I want to add books through the API
  So that authorized store owners can manage the catalog

  Scenario: Reject unauthenticated book creation
    When I send an unauthenticated POST request to the books API endpoint
    Then the POST API response status should be 403
