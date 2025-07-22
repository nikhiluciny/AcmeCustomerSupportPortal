// Import standard modules from LWC for component functionality and decorators
import { LightningElement, api, wire, track } from 'lwc';

// Import wire adapter to retrieve Salesforce record data
import { getRecord } from 'lightning/uiRecordApi';

// Import Apex method to search for Knowledge articles
import searchKnowledge from '@salesforce/apex/CaseDetailsController.searchKnowledge';

// Import method to update a Salesforce record
import { updateRecord } from 'lightning/uiRecordApi';

// Import specific fields from Case and Registration__c objects for record access
import SUBJECT from '@salesforce/schema/Case.Subject';
import STATUS from '@salesforce/schema/Case.Status';
import PRIORITY from '@salesforce/schema/Case.Priority';
import REGISTRATION from '@salesforce/schema/Case.Registration__c';
import SERIAL_NUMBER from '@salesforce/schema/Registration__c.Serial_Number__c';
import REG_DATE from '@salesforce/schema/Registration__c.Registration_Date__c';
import DESCRIPTION from '@salesforce/schema/Case.Description';

// Import custom Apex method to retrieve registration details
import getRegistration from '@salesforce/apex/CaseDetailsController.getRegistration';

// Create a constant array of case fields to retrieve using getRecord
const CASE_FIELDS = [SUBJECT, STATUS, PRIORITY, REGISTRATION];

// Create a constant array of registration fields (though not used in wire)
const REG_FIELDS = [SERIAL_NUMBER, REG_DATE];

// Define and export the CaseDetails LWC class
export default class CaseDetails extends LightningElement {
    // Record ID of the case, passed from parent or standard layout
    @api recordId;

    // Holder for the case data retrieved via getRecord
    caseData;

    // Holder for registration details retrieved via Apex
    registrationData;

    // Generic error object to capture and display errors
    error;

    // Track decorator ensures reactivity on these properties
    @track searchTerm = '';           // Input text for Knowledge search
    @track searchResults = [];        // Result list from Knowledge search
    @track searchError;               // Error during Knowledge search
    @track selectedStatus;            // Currently selected case status
    @track internalComments = '';     // Internal comments to be appended to description

    // Hardcoded status picklist options (could be made dynamic using getPicklistValues)
    @track statusOptions = [
        { label: 'New', value: 'New' },
        { label: 'Working', value: 'Working' },
        { label: 'Escalated', value: 'Escalated' },
        { label: 'Closed', value: 'Closed' }
    ];

    // Wire adapter to fetch case record data based on recordId and CASE_FIELDS
    @wire(getRecord, { recordId: '$recordId', fields: CASE_FIELDS })
    wiredCase({ error, data }) {
        if (data) {
            // Store case field data
            this.caseData = data.fields;

            // Extract related Registration__c Id
            const regId = data.fields.Registration__c?.value;

            // Set default selected status from case
            this.selectedStatus = data.fields.Status.value;

            // If a registration ID exists, fetch registration record
            if (regId) {
                this.fetchRegistration(regId);
            }
        } else if (error) {
            // Capture any error during record fetch
            this.error = error;
        }
    }

    // Calls Apex to retrieve registration fields based on regId
    fetchRegistration(regId) {
        getRegistration({ regId })
            .then(result => {
                // Store registration values in expected format
                this.registrationData = {
                    Serial_Number__c: { value: result.Serial_Number__c },
                    Registration_Date__c: { value: result.Registration_Date__c }
                };
            })
            .catch(err => {
                // Capture any error during registration fetch
                this.error = err;
            });
    }

    // Update local searchTerm as user types in the search input
    handleSearchInput(event) {
        this.searchTerm = event.target.value;
    }
    
    // Update selectedStatus when user selects a new value from the status picklist
    handleStatusChange(event) {
        this.selectedStatus = event.detail.value;
    }

    // Update internal comments field on input change
    handleCommentsChange(event) {
        this.internalComments = event.detail.value;
    }

    // Invokes Apex method to search for knowledge articles based on searchTerm
    handleSearchClick() {
        searchKnowledge({ searchTerm: this.searchTerm })
            .then(data => {
                // Store search results if successful
                this.searchResults = data;
                this.searchError = undefined;
            })
            .catch(err => {
                // Handle errors and clear results
                this.searchError = err;
                this.searchResults = [];
            });
    }

    // Handles save action when user wants to update the case with new status/comments
    handleSave() {
        // Append internal comment to the description field
        const newDesc = '[Agent Comment] ' + this.internalComments;

        // Prepare the fields to update: Id, Status, and new Description
        const fields = {
            Id: this.recordId,
            Status: this.selectedStatus,
            Description: this.caseData.Description?.value
                ? this.caseData.Description.value + '\n' + newDesc
                : newDesc
        };

        // Format the fields as required by updateRecord
        const recordInput = { fields };

        // Perform record update
        updateRecord(recordInput)
            .then(() => {
                // Clear comment input on success
                this.internalComments = '';

                // Dispatch custom event that can be caught by parent component to show a toast
                this.dispatchEvent(
                    new CustomEvent('toast', {
                        detail: { message: 'Case updated successfully.' }
                    })
                );
            })
            .catch(error => {
                // Log and store error on failure
                console.error('Save error:', error);
                this.error = error;
            });
    }
}
