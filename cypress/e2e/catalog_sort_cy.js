describe('Catalog Sorting & All Books Journey', ()=>
{
  it('sould open All Books dropdown and select By price sorting', () => {
   // 1. Visit the main catalog page
   cy.visit('/books/')
   cy.get('body').should('be visible')

   // 2. Trigger the All Books dropdown and click "By Price"
   cy.contains('ALL BOOKS').trigger('mouseover')
   cy.contains('By Price').click({ force: true})

   // 3. Verfiy the URL updates with sorting parameters
   cy.url().should('include', 'sort=price')
   cy.get('img.card-img-top.img-fluid').should('have.length.greaterThan', 1)

  })
})