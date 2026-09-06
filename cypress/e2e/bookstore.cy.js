describe('BookStore E2E & API Suite', () => {

  // 1. Web UI Test
  it('should load the homepage', () => {
    cy.visit('/')
    cy.get('body').should('be.visible')
  })

  // 2. REST API Test
  it('should return 200 OK from local server', () => {
    cy.request('/').then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  // 3. Flapper/Retry Test
  it('handles transient state with retry mechanism', { retries: 2 }, () => {
    cy.get('body').should('exist')
  })

})