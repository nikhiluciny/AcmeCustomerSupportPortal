import { LightningElement, track } from 'lwc';
import getRegistrations from '@salesforce/apex/RegistrationController.getRegistrations';
import createRegistration from '@salesforce/apex/RegistrationController.createRegistration';
import searchAccounts from '@salesforce/apex/RegistrationController.searchAccounts';
import searchProducts from '@salesforce/apex/RegistrationController.searchProducts';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RegistrationWizard extends LightningElement {
    @track registrations = [];
    @track isLoading = true;
    @track showWizard = false;
    @track currentStep = 0;

    selectedRecordType = '';
    recordTypeOptions = [
        { label: 'Standard', value: 'Standard' },
        { label: 'Premium', value: 'Premium' }
    ];

    formData = {
        accountId: '',
        productId: '',
        registrationDate: new Date().toISOString().split('T')[0],
        serialNumber: '',
        email: ''
    };

    @track accountSearchTerm = '';
    @track productSearchTerm = '';
    @track accountOptions = [];
    @track productOptions = [];
    @track showAccountDropdown = false;
    @track showProductDropdown = false;

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Account', fieldName: 'accountName' },
        { label: 'Product', fieldName: 'productName' },
        { label: 'Date', fieldName: 'Registration_Date__c', type: 'date' },
        { label: 'Email', fieldName: 'Email__c' },
        { label: 'Serial Number', fieldName: 'Serial_Number__c' },
        { label: 'Type', fieldName: 'Registration_Type__c' }
    ];

    connectedCallback() {
        this.loadRegistrations();
    }

    get isStep1() {
        return this.currentStep === 1;
    }

    get isStep2() {
        return this.currentStep === 2;
    }

    get isNextDisabled() {
        return this.selectedRecordType === '';
    }

    get showEmpty() {
        return !this.registrations.length && !this.isLoading;
    }

    loadRegistrations() {
        this.isLoading = true;
        getRegistrations()
            .then(data => {
                this.registrations = data.map(r => ({
                    ...r,
                    accountName: r.Account__r?.Name,
                    productName: r.Product__r?.Name
                }));
                this.isLoading = false;
            })
            .catch(() => {
                this.isLoading = false;
                this.showToast('Error', 'Failed to load registrations', 'error');
            });
    }

    startWizard() {
        this.currentStep = 1;
        this.showWizard = true;
    }

    handleRecordTypeChange(event) {
        this.selectedRecordType = event.detail.value;
    }

    handleNext() {
        this.currentStep = 2;
    }

    handleBack() {
        this.currentStep = 1;
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.formData[name] = value;
    }

    handleAccountSearch(event) {
        const term = event.target.value;
        this.accountSearchTerm = term;
        this.formData.accountId = '';

        if (term.length >= 2) {
            this.showAccountDropdown = true;
            searchAccounts({ searchText: term })
                .then(results => {
                    this.accountOptions = results.map(acc => ({
                        label: acc.Name,
                        value: acc.Id
                    }));
                })
                .catch(() => {
                    this.accountOptions = [];
                });
        } else {
            this.accountOptions = [];
            this.showAccountDropdown = false;
        }
    }

    handleAccountFocus() {
        if (this.accountSearchTerm.length >= 2) {
            this.showAccountDropdown = true;
        }
    }

    selectAccount(event) {
        const id = event.currentTarget.dataset.id;
        const label = event.currentTarget.dataset.label;

        this.formData.accountId = id;
        this.accountSearchTerm = label;
        this.accountOptions = [];
        this.showAccountDropdown = false;
    }

    handleProductSearch(event) {
        const term = event.target.value;
        this.productSearchTerm = term;
        this.formData.productId = '';

        if (term.length >= 2) {
            this.showProductDropdown = true;
            searchProducts({ searchText: term })
                .then(results => {
                    this.productOptions = results.map(prod => ({
                        label: prod.Name,
                        value: prod.Id
                    }));
                })
                .catch(() => {
                    this.productOptions = [];
                });
        } else {
            this.productOptions = [];
            this.showProductDropdown = false;
        }
    }

    handleProductFocus() {
        if (this.productSearchTerm.length >= 2) {
            this.showProductDropdown = true;
        }
    }

    selectProduct(event) {
        const id = event.currentTarget.dataset.id;
        const label = event.currentTarget.dataset.label;

        this.formData.productId = id;
        this.productSearchTerm = label;
        this.productOptions = [];
        this.showProductDropdown = false;
    }

    handleSubmit() {
        const payload = {
            ...this.formData,
            recordTypeName: this.selectedRecordType
        };

        createRegistration({ data: payload })
            .then(() => {
                this.showToast('Success', 'Registration created!', 'success');
                this.resetForm();
                this.loadRegistrations();
            })
            .catch(error => {
                this.showToast('Error', error.body?.message || 'Something went wrong', 'error');
            });
    }

    resetForm() {
        this.selectedRecordType = '';
        this.showWizard = false;
        this.currentStep = 0;
        this.accountSearchTerm = '';
        this.productSearchTerm = '';
        this.accountOptions = [];
        this.productOptions = [];
        this.showAccountDropdown = false;
        this.showProductDropdown = false;
        this.formData = {
            accountId: '',
            productId: '',
            registrationDate: new Date().toISOString().split('T')[0],
            serialNumber: '',
            email: ''
        };
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
