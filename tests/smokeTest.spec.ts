import { test } from '../utils/fixtures';
import { expect } from '../utils/custom-expect';
import { validateSchema } from '../utils/schema-validator';

test('Get test tags', async ({api}) => {
    const response = await api
        .path('/tags')
        .getRequest(200);

    await expect(response).toMatchSchema('tags', 'GET_tags');

});

test.describe('create, update and delete an article', () => {
    test.describe.configure({ mode: 'serial' });
    let slugID: string;
    let articleTitle: string;
    let updatedDescription: string = 'updated description';

    test('create an article', async ({ api }) => {
        const createArticleResponse = await api
            .path('/articles')
            .body(require('../request-payloads/POST-article.json'))
            .postRequest(201)
        slugID = createArticleResponse.article.slug;
        articleTitle = createArticleResponse.article.title;
        console.log(`slug id: ${slugID}`);
    });

    test('check if article is created', async ({ api }) => {
        const articleResponse = await api
            .path('/articles')
            .params({ limit: 10, offset: 0 })
            .getRequest(200);
        expect(articleResponse.articles[0].title).shouldBe(`${articleTitle}`);        
    });

    test('update the article', async ({ api }) => {
        const updatedArticleResponse = await api
        .path(`/articles/${slugID}`)
        .body({
                "article": {
                    ...require('../request-payloads/PUT-article.json').article,
                    "description": updatedDescription,
                    "slug": slugID,
                }
            })
        .putRequest(200);
    });

    test('check if article is updated', async ({ api }) => {
        const articleResponse = await api
            .path('/articles')
            .params({ limit: 10, offset: 0 })
            .getRequest(200);
        expect(articleResponse.articles[0].title).toBe(`${articleTitle}`);   
        expect(articleResponse.articles[0].description).toBe(`${updatedDescription}`);        
    });

    test('delete the article', async ({ api }) => {
        const deleteArticleResponse = await api
            .path(`/articles/${slugID}`)
            .deleteRequest(204);
    });

    test('check if article is deleted', async ({ api }) => {
        const articleResponse = await api
            .path('/articles')
            .params({ limit: 10, offset: 0 })
            .getRequest(200);
        expect(articleResponse.articles[0].title).not.toBe('test article 01');        
    });

});
