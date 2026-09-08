/**
 * Base Page Object - Contains common methods for all pages
 */
export class BasePage {
  visit(path = '/') {
    cy.visit(path);
    cy.get('body').should('be.visible');
  }

  waitForPageLoad(timeout = 2000) {
    cy.wait(timeout);
    cy.get('body').should('be.visible');
  }

  getElement(selector) {
    return cy.get(selector);
  }

  clickElement(selector) {
    cy.get(selector).click({ force: true });
  }

  fillInput(selector, text) {
    cy.get(selector).clear().type(text);
  }

  selectDropdown(selector, value) {
    cy.get(selector).select(value);
  }

  verifyUrlIncludes(path) {
    cy.url().should('include', path);
  }

  verifyElementVisible(selector) {
    cy.get(selector).should('be.visible');
  }

  verifyElementNotVisible(selector) {
    cy.get(selector).should('not.be.visible');
  }

  verifyTextContent(selector, text) {
    cy.get(selector).should('contain', text);
  }

  hoverElement(selector) {
    cy.get(selector).trigger('mouseover');
  }

  getElementText(selector) {
    return cy.get(selector).invoke('text');
  }
}
