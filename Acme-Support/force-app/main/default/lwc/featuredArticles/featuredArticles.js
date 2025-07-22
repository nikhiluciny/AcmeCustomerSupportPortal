import { LightningElement, wire, api } from 'lwc';
import getArticles from '@salesforce/apex/FeaturedArticlesController.getArticles';

export default class FeaturedArticles extends LightningElement {
    articles;
    error;
    @api siteBaseUrl = '/acmesupport/s'; // your site path

    @wire(getArticles)
wiredArticles({ data, error }) {
    if (data) {
        this.articles = data.map(article => ({
            ...article,
            articleUrl: `/acmesupport/s/article/${article.UrlName}`
        }));
        this.error = undefined;
    } else if (error) {
        this.error = error;
        this.articles = undefined;
    }
}

}
