trigger RegistrationTrigger on Registration__c (before insert, before update, after insert) {
    for (Registration__c reg : Trigger.new) {
        
        if (Trigger.isBefore) {
            if (reg.Email__c != null) {
                Pattern emailPattern = Pattern.compile('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$');
                if (!emailPattern.matcher(reg.Email__c).matches()) {
                    reg.Email__c.addError('Please enter a valid email address.');
                }
            }
            if (reg.Registration_Date__c != null && reg.Registration_Date__c > Date.today()) {
                reg.Registration_Date__c.addError('Date cannot be in the future.');
            }
        }

        
    }
}
