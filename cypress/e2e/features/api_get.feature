Feature: Bookstore API GET endpoints
  As an API consumer
  I want to retrieve bookstore resources
  So that clients can use the catalog and shopping bag data

  Scenario: Retrieve bookstore resources with GET requests
    When I send a GET request to the books API endpoint
    Then the API response status should be 200
    And the API response should contain a results array
    When I send a GET request for the first returned book
    Then the API response status should be 200
    And the API response should contain the first book ID
    When I send a GET request to the categories API endpoint
    Then the API response status should be 200
    And the API response should contain a results array
    When I send a GET request to the bag API endpoint
    Then the API response status should be 200
    And the API response should contain a book count
