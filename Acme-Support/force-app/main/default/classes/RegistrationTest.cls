@isTest
private class RegistrationTest {

    private static Map<String, Id> setupDependencies() {
        Account acct = new Account(Name = 'Test Account');
        insert acct;

        Product__c prod = new Product__c(Name = 'Test Product', SKU__c = 'SKU-001');
        insert prod;

        return new Map<String, Id>{
            'AccountId' => acct.Id,
            'ProductId' => prod.Id
        };
    }

    @isTest
    static void testCreateFromJson_Success() {
        Map<String, Id> deps = setupDependencies();

        Registration__c reg = new Registration__c(
            Email__c = 'test@example.com',
            Registration_Date__c = Date.today(),
            Account__c = deps.get('AccountId'),
            Product__c = deps.get('ProductId')
        );

        String json = JSON.serialize(reg);

        System.Test.startTest();
        Id regId = RegistrationService.createFromJson(json);
        System.Test.stopTest();

        System.assertNotEquals(null, regId, 'Expected a valid Registration Id');

        Registration__c inserted = [
            SELECT Email__c, Registration_Date__c
            FROM Registration__c
            WHERE Id = :regId
        ];
        System.assertEquals('test@example.com', inserted.Email__c);
    }

    @isTest
    static void testTrigger_InvalidEmail() {
        Map<String, Id> deps = setupDependencies();

        Registration__c reg = new Registration__c(
            Email__c = 'invalid-email',
            Registration_Date__c = Date.today(),
            Account__c = deps.get('AccountId'),
            Product__c = deps.get('ProductId')
        );

        System.Test.startTest();
        try {
            insert reg;
            System.assert(false, 'Expected email validation error');
        } catch (DmlException e) {
            System.assert(e.getMessage().contains('valid email address'), 'Expected email format validation error');
        }
        System.Test.stopTest();
    }

    @isTest
    static void testTrigger_FutureDate() {
        Map<String, Id> deps = setupDependencies();

        Registration__c reg = new Registration__c(
            Email__c = 'future@test.com',
            Registration_Date__c = Date.today().addDays(1),
            Account__c = deps.get('AccountId'),
            Product__c = deps.get('ProductId')
        );

        System.Test.startTest();
        try {
            insert reg;
            System.assert(false, 'Expected future date error');
        } catch (DmlException e) {
            System.assert(
                e.getMessage().contains('Date cannot be in the future'),
                'Expected future date validation error but got: ' + e.getMessage()
            );
        }
        System.Test.stopTest();
    }

    @isTest
    static void testTrigger_ValidInsert() {
        Map<String, Id> deps = setupDependencies();

        Registration__c reg = new Registration__c(
            Email__c = 'valid@test.com',
            Registration_Date__c = Date.today(),
            Account__c = deps.get('AccountId'),
            Product__c = deps.get('ProductId')
        );

        insert reg;

        Registration__c inserted = [SELECT Email__c FROM Registration__c WHERE Id = :reg.Id];
        System.assertEquals('valid@test.com', inserted.Email__c);
    }
}
