Feature: Catalog Sorting
  As a customer browsing the bookstore
  I want to sort the book catalog
  So that I can easily find books within my price range

  Scenario: User sorts the book catalog by price low to high
    Given I open the bookstore catalog page
    When I select "By Price" sorting from the menu
    Then the books should be displayed in ascending order by price