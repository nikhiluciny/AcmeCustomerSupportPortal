public with sharing class CaseDetailsController {
    @AuraEnabled(cacheable=false)
    public static Registration__c getRegistration(String regId) {
    return [
        SELECT Serial_Number__c, Registration_Date__c
        FROM Registration__c
        WHERE Id = :regId
        LIMIT 1
    ];
}


    @AuraEnabled(cacheable=false)
    public static List<Knowledge__kav> searchKnowledge(String searchTerm) {
        String soslQuery = 'FIND :searchTerm IN ALL FIELDS RETURNING Knowledge__kav(Title, Summary, UrlName WHERE PublishStatus = \'Online\' LIMIT 5)';
        List<List<SObject>> searchResults = Search.query(soslQuery);
        List<Knowledge__kav> results = new List<Knowledge__kav>();
        if (!searchResults.isEmpty()) {
            for (SObject sobj : searchResults[0]) {
                results.add((Knowledge__kav)sobj);
            }
        }
        return results;
    }
}
