public with sharing class RegistrationController {


    @AuraEnabled(cacheable=true)
    public static List<Registration__c> getRegistrations() {
        return [
            SELECT Id, Name, Account__c, Account__r.Name, Product__c, Product__r.Name,
                   Registration_Date__c, Email__c, Serial_Number__c, Registration_Type__c
            FROM Registration__c
            ORDER BY CreatedDate DESC
            LIMIT 50
        ];
    }

    @AuraEnabled
    public static Id createRegistration(Map<String, Object> data) {
        String recordTypeName = (String)data.get('recordTypeName');
        Id recordTypeId = Schema.SObjectType.Registration__c.getRecordTypeInfosByName().get(recordTypeName).getRecordTypeId();

        Registration__c reg = new Registration__c();
        reg.RecordTypeId = recordTypeId;
        reg.Account__c = (Id)data.get('accountId');
        reg.Product__c = (Id)data.get('productId');
        reg.Registration_Date__c = Date.valueOf((String)data.get('registrationDate'));
        reg.Serial_Number__c = (String)data.get('serialNumber');
        reg.Email__c = (String)data.get('email');
        reg.Registration_Type__c = recordTypeName;

        insert reg;
        return reg.Id;
    }
    @AuraEnabled
public static List<Account> searchAccounts(String searchText) {
    return [
        SELECT Id, Name FROM Account
        WHERE Name LIKE :('%' + searchText + '%')
        LIMIT 10
    ];
}

@AuraEnabled
public static List<Product__c> searchProducts(String searchText) {
    return [
        SELECT Id, Name FROM Product__c
        WHERE Name LIKE :('%' + searchText + '%')
        LIMIT 10
    ];
}


}
