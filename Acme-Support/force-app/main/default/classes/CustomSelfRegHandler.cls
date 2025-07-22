global with sharing class CustomSelfRegHandler implements Auth.ConfigurableSelfRegHandler {

    global Id createUser(Id portalId, Id accountId, Map<Schema.SObjectField, String> userFields, String password) {
        String firstName = userFields.get(User.FirstName);
        String lastName  = userFields.get(User.LastName);
        String email     = userFields.get(User.Email);
        String username  = userFields.get(User.Username);
        String nickname  = userFields.get(User.CommunityNickname);
        String company   = userFields.get(User.CompanyName); // This is the "Account Name"

        // 🔍 Step 1: Find or create Account
        Account acc;
        List<Account> accs = [SELECT Id FROM Account WHERE Name = :company LIMIT 1];
        if (!accs.isEmpty()) {
            acc = accs[0];
        } else {
            acc = new Account(Name = company);
            insert acc;
        }

        // 👤 Step 2: Create Contact
        Contact contact = new Contact(
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            AccountId = acc.Id
        );
        insert contact;

        // 👥 Step 3: Create User (DO NOT set AccountId)
        Profile p = [SELECT Id FROM Profile WHERE Name = 'External Customer' LIMIT 1];

        User u = new User(
            FirstName = firstName,
            LastName = lastName,
            Username = username,
            Email = email,
            Alias = (username.length() > 8 ? username.substring(0, 8) : username),
            TimeZoneSidKey = 'America/New_York',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            ProfileId = p.Id,
            ContactId = contact.Id,
            CommunityNickname = nickname
        );
        insert u;

        // 🔐 Step 4: Set the password AFTER insert
        System.setPassword(u.Id, password);

        return u.Id;
    }
}
