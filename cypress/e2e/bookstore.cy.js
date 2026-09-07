describe('BookStore Multi-Page User Journey Suite', () => {

  it('should navigate through catalog, filter by category, search, and view book details', () => {
    // 1. Start at the main book catalog
    cy.visit('/books/')
    cy.get('body').should('be.visible')
    cy.get('img').should('have.length.greaterThan', 1)

    // 2. Navigate to a category page using exact title case
   	// 2. Open dropdown and click a subcategory under Technology
    // 2. Open dropdown and click a subcategory under Technology
   cy.contains('Technology').trigger('mouseover')
   cy.contains('Software').click({ force: true })
   cy.url().should('include', 'category')

   // 3. Perform a search transition
   cy.location('pathname').should('eq', '/books/')
  cy.get('input[placeholder*="Search"]').first().type('Excel')
  cy.get('input[placeholder*="Search"]').first().type('{enter}')
   cy.contains('Excel Formulas and Functions').should('be.visible')

    // 4. Click on a specific book to view its product detail page
    cy.contains('Excel Formulas and Functions').click()
    cy.url().should('include', '/books/')
    cy.get('body').should('contain', 'Excel Formulas and Functions')
  })

  // API Health Check
  it('should return 200 OK from the catalog endpoint', () => {
    cy.request('/books/').then((response) => {
      expect(response.status).to.eq(200)
    })
  })

})