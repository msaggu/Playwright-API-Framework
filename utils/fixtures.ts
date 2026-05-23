import { test as base } from '@playwright/test';
import { RequestHandler } from './request-handler';
import { APILogger } from './logger';

type MyFixtures = {
    api: RequestHandler;
};

export const test = base.extend<MyFixtures>({
    api: async ({request}, use) => {
        const baseUrl = 'https://conduit-api.bondaracademy.com/api';
        const logger = new APILogger();
        const requestHandler = new RequestHandler(request, baseUrl, logger);
        await use(requestHandler);
    }
});