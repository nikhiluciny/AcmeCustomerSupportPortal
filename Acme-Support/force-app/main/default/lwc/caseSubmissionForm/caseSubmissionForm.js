// caseSubmissionForm.js
import { LightningElement, track } from 'lwc';
import getCurrentUserContactId from '@salesforce/apex/CaseSubmissionController.getCurrentUserContactId';
import searchAccounts from '@salesforce/apex/CaseSubmissionController.searchAccounts';
import searchProducts from '@salesforce/apex/CaseSubmissionController.searchProducts';
import getRegistrationsForCase from '@salesforce/apex/CaseSubmissionController.getRegistrationsForCase';
import createRegistration from '@salesforce/apex/CaseSubmissionController.createRegistration';
import createCase from '@salesforce/apex/CaseSubmissionController.createCase';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CaseSubmissionForm extends LightningElement {
    @track contactId;
    @track formData = {
        accountId: '',
        productId: '',
        registrationId: '',
        description: '',
        priority: 'Medium',
        origin: 'Web'
    };
    @track serialNumber = '';
    @track email = '';

    @track accountSearchTerm = '';
    @track accountOptions = [];
    @track showAccountDropdown = false;

    @track productSearchTerm = '';
    @track productOptions = [];
    @track showProductDropdown = false;

    @track registrationOptions = [];
    @track showNewRegistrationFields = false;

    connectedCallback() {
        getCurrentUserContactId()
            .then(id => {
                this.contactId = id;
            });
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
    }

    handleAccountSearch(event) {
        const term = event.target.value;
        this.accountSearchTerm = term;
        if (term.length >= 2) {
            this.showAccountDropdown = true;
            searchAccounts({ searchText: term })
                .then(results => {
                    this.accountOptions = results.map(acc => ({ label: acc.Name, value: acc.Id }));
                });
        } else {
            this.showAccountDropdown = false;
        }
    }

    selectAccount(event) {
        const id = event.currentTarget.dataset.id;
        const label = event.currentTarget.dataset.label;
        this.formData.accountId = id;
        this.accountSearchTerm = label;
        this.showAccountDropdown = false;
        this.tryFetchRegistrations();
    }

    handleProductSearch(event) {
        const term = event.target.value;
        this.productSearchTerm = term;
        if (term.length >= 2) {
            this.showProductDropdown = true;
            searchProducts({ searchText: term })
                .then(results => {
                    this.productOptions = results.map(prod => ({ label: prod.Name, value: prod.Id }));
                });
        } else {
            this.showProductDropdown = false;
        }
    }

    selectProduct(event) {
        const id = event.currentTarget.dataset.id;
        const label = event.currentTarget.dataset.label;
        this.formData.productId = id;
        this.productSearchTerm = label;
        this.showProductDropdown = false;
        this.tryFetchRegistrations();
    }

    tryFetchRegistrations() {
        if (this.formData.accountId && this.formData.productId) {
            getRegistrationsForCase({
                accountId: this.formData.accountId,
                productId: this.formData.productId
            }).then(results => {
                if (results.length) {
                    this.registrationOptions = results.map(r => ({ label: `${r.Name} (${r.Serial_Number__c})`, value: r.Id }));
                    this.showNewRegistrationFields = false;
                } else {
                    this.registrationOptions = [];
                    this.showNewRegistrationFields = true;
                }
            });
        }
    }

    handleNewRegistrationInput(event) {
        const { name, value } = event.target;
        if (name === 'serialNumber') this.serialNumber = value;
        if (name === 'email') this.email = value;
    }

    handleSubmit() {
        if (!this.formData.accountId || !this.formData.productId) {
            this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: 'Please select Account and Product.', variant: 'error' }));
            return;
        }

        const handleCaseCreate = (registrationId) => {
            createCase({
                caseData: {
                    ContactId: this.contactId,
                    AccountId: this.formData.accountId,
                    Product__c: this.formData.productId,
                    Registration__c: registrationId,
                    Description: this.formData.description,
                    Priority: this.formData.priority,
                    Origin: this.formData.origin
                }
            }).then(() => {
                this.dispatchEvent(new ShowToastEvent({ title: 'Success', message: 'Case submitted successfully!', variant: 'success' }));
            });
        };

        if (this.showNewRegistrationFields) {
            createRegistration({
                data: {
                    Account__c: this.formData.accountId,
                    Product__c: this.formData.productId,
                    Email__c: this.email,
                    Serial_Number__c: this.serialNumber
                }
            }).then(reg => {
                handleCaseCreate(reg.Id);
            });
        } else {
            handleCaseCreate(this.formData.registrationId);
        }
    }
}
