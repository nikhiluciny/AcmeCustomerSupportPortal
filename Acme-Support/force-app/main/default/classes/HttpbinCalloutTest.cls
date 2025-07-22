@isTest
private class HttpbinCalloutTest {
    @isTest
    static void testHttpbinCallout() {
        System.Test.setMock(HttpCalloutMock.class, new HttpbinMock());

        System.Test.startTest();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Auth0Httpbin/bearer');
        req.setMethod('GET');

        Http http = new Http();
        HttpResponse res = http.send(req);
        System.Test.stopTest();

        System.assertEquals(201, res.getStatusCode());
        System.assertEquals('{"success": true}', res.getBody());
    }
}
