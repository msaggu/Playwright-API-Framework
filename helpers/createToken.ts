import { APILogger } from "../utils/logger";
import { RequestHandler } from "../utils/request-handler";
import { request } from '@playwright/test';
import { config } from '../api-test.config';


export async function createToken(email: string, password: string) {
    const logger = new APILogger();
    const context = await request.newContext();
    const api = new RequestHandler(context, config.apiURL, logger);

    try {
        const responseJSON = await api
            .path('/users/login')
            .body({ "user": { "email": email, "password": password } })
            .postRequest(200);

        return `Token ${responseJSON.user.token}`;
    } finally {
        await context.dispose();
    }

}