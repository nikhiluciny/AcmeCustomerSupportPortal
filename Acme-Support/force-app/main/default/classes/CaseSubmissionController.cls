public with sharing class CaseSubmissionController {

    @AuraEnabled(cacheable=true)
    public static Id getCurrentUserContactId() {
        return [SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1].ContactId;
    }

    @AuraEnabled
    public static List<Account> searchAccounts(String searchText) {
        return [SELECT Id, Name FROM Account WHERE Name LIKE :('%' + searchText + '%') LIMIT 10];
    }

    @AuraEnabled
    public static List<Product__c> searchProducts(String searchText) {
        return [SELECT Id, Name FROM Product__c WHERE Name LIKE :('%' + searchText + '%') LIMIT 10];
    }

    @AuraEnabled
    public static List<Registration__c> getRegistrationsForCase(Id accountId, Id productId) {
        return [
            SELECT Id, Name, Serial_Number__c
            FROM Registration__c
            WHERE Account__c = :accountId AND Product__c = :productId
            ORDER BY CreatedDate DESC
        ];
    }

    @AuraEnabled
    public static Registration__c createRegistration(Map<String, Object> data) {
        Registration__c reg = new Registration__c(
            Account__c = (Id)data.get('Account__c'),
            Product__c = (Id)data.get('Product__c'),
            Email__c = (String)data.get('Email__c'),
            Serial_Number__c = (String)data.get('Serial_Number__c')
        );
        insert reg;
        return reg;
    }

    @AuraEnabled
    public static void createCase(Map<String, Object> caseData) {
        Case c = new Case(
            ContactId = (Id)caseData.get('ContactId'),
            AccountId = (Id)caseData.get('AccountId'),
            Product__c = (Id)caseData.get('Product__c'),
            Registration__c = (Id)caseData.get('Registration__c'),
            Description = (String)caseData.get('Description'),
            Priority = (String)caseData.get('Priority'),
            Origin = (String)caseData.get('Origin')
        );
        insert c;
    }
}
