import { test as base } from '@playwright/test';
import { RequestHandler } from './request-handler';
import { APILogger } from './logger';
import { setCustomExpectLogger } from './custom-expect';
import { config } from '../api-test.config';

type MyFixtures = {
    api: RequestHandler;
    config: typeof config
};

export const test = base.extend<MyFixtures>({
    api: async ({request}, use) => {
        const logger = new APILogger();
        setCustomExpectLogger(logger);
        const requestHandler = new RequestHandler(request, config.apiURL, logger);
        await use(requestHandler);
    },
    config: async({}, use) => {
        await use(config);
    }
});