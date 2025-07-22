public class HttpbinMock implements HttpCalloutMock {
    public HTTPResponse respond(HTTPRequest req) {
        System.debug('>>> MOCK HIT: Returning 201 Created');
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"success": true}');
        res.setStatusCode(201);
        return res;
    }
}
