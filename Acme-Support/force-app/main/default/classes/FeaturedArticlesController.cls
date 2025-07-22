public with sharing class FeaturedArticlesController {
    @AuraEnabled(cacheable=true)
    public static List<Knowledge__kav> getArticles() {
        return [
            SELECT Id, Title, UrlName, Summary
            FROM Knowledge__kav
            WHERE PublishStatus = 'Online' AND Language = 'en_US'
            ORDER BY LastPublishedDate DESC
            LIMIT 5
        ];
    }
}
