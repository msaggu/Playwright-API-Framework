import { test } from '../utils/fixtures';
import { expect } from '@playwright/test';
import { APILogger } from '../utils/logger';

let authToken: string;

test.beforeAll('Get token', async ({ api }) => {
    const responseJSON = await api
        .path('/users/login')
        .body({ "user": { "email": process.env.TEST_EMAIL, "password": process.env.TEST_PASSWORD } })
        .postRequest(200);
    authToken = `Token ${responseJSON.user.token}`;
})


test.describe('create, update and delete an article', () => {
    test.describe.configure({ mode: 'serial' });
    let slugID: string;
    let articleTitle: string;
    let updatedDescription: string = 'updated description';

    test('create an article', async ({ api }) => {
        const createArticleResponse = await api
            .path('/articles')
            .headers({ "Authorization": `${authToken}` })
            .body({
                "article": {
                    "title": "test article 01",
                    "description": "test",
                    "body": "playwright test",
                    "tagList": ["api"]
                }
            })
            .postRequest(201)
        slugID = createArticleResponse.article.slug;
        articleTitle = createArticleResponse.article.title;
        console.log(`slug id: ${slugID}`);
    });

    test('check if article is created', async ({ api }) => {
        const articleResponse = await api
            .path('/articles')
            .params({ limit: 10, offset: 0 })
            .headers({ "Authorization": `${authToken}` })
            .getRequest(200);
        expect(articleResponse.articles[0].title).toBe(`${articleTitle}`);        
    });

    test('update the article', async ({ api }) => {
        const updatedArticleResponse = await api
        .path(`/articles/${slugID}`)
        .headers({ "Authorization": `${authToken}` })
        .body({
                "article": {
                    "title": "test article 01",
                    "description": updatedDescription,
                    "body": "playwright test",
                    "slug": slugID,
                    "tagList": ["api"]
                }
            })
        .putRequest(200);
    });

    test('check if article is updated', async ({ api }) => {
        const articleResponse = await api
            .path('/articles')
            .params({ limit: 10, offset: 0 })
            .headers({ "Authorization": `${authToken}` })
            .getRequest(200);
        expect(articleResponse.articles[0].title).toBe(`${articleTitle}`);   
        expect(articleResponse.articles[0].description).toBe(`${updatedDescription}`);        
    });

    test('delete the article', async ({ api }) => {
        const deleteArticleResponse = await api
            .path(`/articles/${slugID}`)
            .headers({ "Authorization": `${authToken}` })
            .deleteRequest(204);
    });

    test('check if article is deleted', async ({ api }) => {
        const articleResponse = await api
            .path('/articles')
            .params({ limit: 10, offset: 0 })
            .headers({ "Authorization": `${authToken}` })
            .getRequest(200);
        expect(articleResponse.articles[0].title).not.toBe('test article 01');        
    });

});
