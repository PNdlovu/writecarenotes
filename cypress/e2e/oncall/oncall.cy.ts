/**
 * @writecarenotes.com
 * @fileoverview E2E Tests for OnCall System
 * @version 1.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

describe('OnCall System', () => {
    beforeEach(() => {
        // Setup test data and intercept API calls
        cy.intercept('GET', '/api/v1/oncall/records*', { fixture: 'oncall/activeRecords.json' }).as('getRecords');
        cy.intercept('GET', '/api/v1/oncall/staff/available*', { fixture: 'oncall/availableStaff.json' }).as('getStaff');
        cy.intercept('POST', '/api/v1/oncall/records', { fixture: 'oncall/newRecord.json' }).as('createRecord');
        cy.intercept('PATCH', '/api/v1/oncall/records/*', { fixture: 'oncall/updatedRecord.json' }).as('updateRecord');
        
        // Visit the OnCall dashboard
        cy.visit('/care/oncall');
    });

    it('should load and display the dashboard', () => {
        cy.wait(['@getRecords', '@getStaff']);
        
        // Verify dashboard components
        cy.get('[data-testid="active-calls-section"]').should('be.visible');
        cy.get('[data-testid="available-staff-section"]').should('be.visible');
        
        // Verify active calls are displayed
        cy.get('[data-testid="call-item"]').should('have.length.at.least', 1);
        
        // Verify staff list is displayed
        cy.get('[data-testid="staff-item"]').should('have.length.at.least', 1);
    });

    it('should create a new call record', () => {
        // Click new call button
        cy.get('[data-testid="new-call-fab"]').click();
        
        // Fill out the form
        cy.get('[data-testid="category-input"]').type('Medical Emergency');
        cy.get('[data-testid="priority-select"]').click();
        cy.get('[data-testid="priority-option-urgent"]').click();
        cy.get('[data-testid="description-input"]').type('Patient requires immediate attention');
        
        // Submit the form
        cy.get('[data-testid="submit-call"]').click();
        
        // Verify API call
        cy.wait('@createRecord');
        
        // Verify new record appears in the list
        cy.get('[data-testid="call-item"]').should('contain', 'Medical Emergency');
    });

    it('should assign staff to a call', () => {
        // Click on a call item
        cy.get('[data-testid="call-item"]').first().click();
        
        // Click assign staff button
        cy.get('[data-testid="assign-staff-button"]').click();
        
        // Select a staff member
        cy.get('[data-testid="staff-option"]').first().click();
        
        // Add assignment notes
        cy.get('[data-testid="assignment-notes"]').type('Please attend immediately');
        
        // Confirm assignment
        cy.get('[data-testid="confirm-assignment"]').click();
        
        // Verify API call
        cy.wait('@updateRecord');
        
        // Verify assignment is reflected in UI
        cy.get('[data-testid="call-item"]').first()
            .should('contain', 'Assigned to:')
            .and('contain', 'John Doe');
    });

    it('should handle offline mode', () => {
        // Simulate offline mode
        cy.window().then((win) => {
            cy.stub(win.navigator.serviceWorker, 'register').resolves();
            cy.stub(win.navigator, 'onLine').value(false);
            win.dispatchEvent(new Event('offline'));
        });

        // Create new call while offline
        cy.get('[data-testid="new-call-fab"]').click();
        cy.get('[data-testid="category-input"]').type('Offline Test');
        cy.get('[data-testid="priority-select"]').click();
        cy.get('[data-testid="priority-option-high"]').click();
        cy.get('[data-testid="description-input"]').type('Testing offline functionality');
        cy.get('[data-testid="submit-call"]').click();

        // Verify call is stored locally
        cy.get('[data-testid="call-item"]').should('contain', 'Offline Test');
        cy.get('[data-testid="offline-indicator"]').should('be.visible');

        // Simulate coming back online
        cy.window().then((win) => {
            cy.stub(win.navigator, 'onLine').value(true);
            win.dispatchEvent(new Event('online'));
        });

        // Verify sync occurs
        cy.wait('@createRecord');
        cy.get('[data-testid="offline-indicator"]').should('not.exist');
    });

    it('should handle notifications', () => {
        // Subscribe to notifications
        cy.window().then((win) => {
            cy.stub(win.Notification, 'requestPermission').resolves('granted');
        });

        // Simulate incoming notification
        cy.window().then((win) => {
            const notification = {
                type: 'new-call',
                priority: 'urgent',
                title: 'New Emergency',
                message: 'Urgent assistance required'
            };
            win.postMessage({ type: 'NOTIFICATION', payload: notification }, '*');
        });

        // Verify notification badge
        cy.get('[data-testid="notification-badge"]').should('contain', '1');

        // Click notification
        cy.get('[data-testid="notification-item"]').click();

        // Verify navigation to relevant call
        cy.get('[data-testid="call-details"]').should('contain', 'New Emergency');
    });

    it('should be accessible', () => {
        // Check for ARIA labels
        cy.get('[aria-label="On-Call Dashboard"]').should('exist');
        cy.get('[aria-label="Create New Call"]').should('exist');

        // Check focus management
        cy.get('[data-testid="new-call-fab"]').focus()
            .type('{enter}');
        cy.get('[data-testid="category-input"]').should('have.focus');

        // Run accessibility audit
        cy.injectAxe();
        cy.checkA11y();
    });
});
