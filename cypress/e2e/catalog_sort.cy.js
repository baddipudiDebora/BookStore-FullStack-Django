describe('Catalog Sorting & All Books Journey', () => {
  it('should open All Books dropdown and select By price sorting', () => {
    // 1. Visit the main catalog page
    cy.visit('/books/')
    cy.get('body').should('be.visible')

    // 2. Trigger the All Books dropdown and click "By Price"
    cy.contains('All Books').trigger('mouseover')
    cy.contains('By Price').click({ force: true })

    // 3. Verify URL updates and wait for the sort selector to confirm the new page has fully loaded
    cy.url().should('include', 'sort=price')
    cy.get('#sort-selector').should('have.value', 'price_asc')

    // 4. Extract prices in natural DOM order and validate ascending order
    cy.get('.book-container .card').then($cards => {
      const prices = []

      $cards.each((index, card) => {
        const text = Cypress.$(card).find('.font-weight-bold').text()
        const match = text.match(/\$([0-9]+\.[0-9]{2})/)
        if (match) {
          prices.push(parseFloat(match[1]))
        }
      })

      // Log prices to the Cypress command log for verification
      cy.log('Extracted Prices:', JSON.stringify(prices))

      // Ensure we found prices to compare
      expect(prices.length).to.be.greaterThan(1)

      // Verify that each price is less than or equal to the next one
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i], `Price at index ${i} (${prices[i]}) should be <= index ${i+1} (${prices[i+1]})`).to.be.at.most(prices[i + 1])
      }
    })
  })
})