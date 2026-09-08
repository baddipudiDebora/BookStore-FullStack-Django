Feature: User Checkout Process

  Scenario: User attempts to checkout non-existent promotional item
    Given the user is on the books catalog page
    When the user clicks on a non-existent promotional banner
    Then the checkout confirmation modal should be visible