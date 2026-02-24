// File: ./Frontend/cypress/e2e/admin_stats.cy.js

// This test suite validates the core functionality of the Admin Dashboard,
// ensuring the API calls work and critical data is rendered correctly.
describe('Admin Dashboard Functionality', () => {

    // Runs before each test case to log the admin in
    beforeEach(() => {
      // 1. Visit the login page (Cypress uses the CYPRESS_BASE_URL environment variable)
      cy.visit('/admin-login'); 
  
      // 2. Input Admin Credentials from Cypress env (with guard)
      const email = Cypress.env('ADMIN_EMAIL');
      const password = Cypress.env('ADMIN_PASSWORD');
      expect(email, 'ADMIN_EMAIL is set').to.be.a('string').and.not.be.empty;
      expect(password, 'ADMIN_PASSWORD is set').to.be.a('string').and.not.be.empty;
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      
      // 3. Click the login button
      cy.get('button[type="submit"]').click();
      
      // 4. Verify successful redirection to the Admin Dashboard
      cy.url().should('include', '/admin-dashboard'); 
    });
  
    it('1. Should display key stats (Total Buyers / Total Sellers)', () => {
      // Ensure we are on the dashboard and the heading is visible
      cy.url().should('include', '/admin-dashboard');
      cy.contains('Admin Dashboard').should('be.visible');

      // Verify Total Buyers and Total Sellers cards render with numeric values
      cy.contains('Total Buyers')
        .parents('.stat-card')
        .find('.stat-value')
        .invoke('text')
        .should('match', /^\d+$/);

      cy.contains('Total Sellers')
        .parents('.stat-card')
        .find('.stat-value')
        .invoke('text')
        .should('match', /^\d+$/);
    });
  
    it('2. Should correctly display Total Buyers as a number', () => {
      cy.contains('Total Buyers')
        .parents('.stat-card')
        .find('.stat-value')
        .invoke('text')
        .should('match', /^\d+$/);
    });
  
    it('3. Should allow navigation to Vehicles on Sale', () => {
      // Click the sidebar link
      cy.contains('Vehicles on Sale').click();

      // Verify route updated
      cy.url().should('include', '/admin-vehicles-on-sale');
    });
  });