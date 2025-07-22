public with sharing class RegistrationService {
    @AuraEnabled
    public static Id createFromJson(String jsonPayload) {
        Registration__c reg = (Registration__c) JSON.deserialize(jsonPayload, Registration__c.class);
        insert reg;
        return reg.Id;
    }
}
