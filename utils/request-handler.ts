import { APIRequestContext } from "@playwright/test";
import { APILogger } from "./logger";

export class RequestHandler {

    private logger: APILogger;
    private request: APIRequestContext;
    private baseUrl: string | undefined;
    private defaultBaseUrl: string;
    private apiPath: string = '';
    private queryParams: object = {};
    private apiHeaders: Record<string, string> = {};
    private apiBody: object = {};

    constructor(request: APIRequestContext, apiBaseUrl: string, logger: APILogger) {
        this.request = request;
        this.defaultBaseUrl = apiBaseUrl;
        this.logger = logger;
    }

    /** Sets the base URL (e.g. `https://api.example.com`). */
    url(url: string) {
        this.baseUrl = url;
        return this;
    }

    /** Sets the path appended to the base URL (e.g. `/users/123`). */
    path(path: string) {
        this.apiPath = path;
        return this;
    }

    /** Sets the query string parameters (e.g. `{ page: 1, limit: 20 }`). */
    params(params: object) {
        this.queryParams = params;
        return this;
    }

    /** Sets the request headers (e.g. `{ Authorization: 'Bearer token' }`). */
    headers(headers: Record<string, string>) {
        this.apiHeaders = headers;
        return this;
    }

    /** Sets the request body for POST/PUT/PATCH requests. */
    body(body: object) {
        this.apiBody = body;
        return this;
    }

    private getUrl() {
        const url = new URL(`${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`);
        for (const [key, value] of Object.entries(this.queryParams)) {
            url.searchParams.append(key, value);
        }
        return url.toString();
    }

    private statusCodeValidator(actualStatus: number, expectedStatus: number, callingMethod: Function) {
        if (actualStatus !== expectedStatus) {
            const logs = this.logger.getRecentLogs();
            const error = new Error(`Expected Status: ${expectedStatus}, Received Status: ${actualStatus}
                \n\nRecent API Activity: \n${logs}`);
            Error.captureStackTrace(error, callingMethod);
            throw error;
        }
    }

    async getRequest(statusCode: number) {
        const url = this.getUrl();
        this.logger.logRequest('GET', url, this.apiHeaders);
        const response = await this.request.get(url, {
            headers: this.apiHeaders
        });
        const actualStatusCode = response.status();
        const responseJSON = await response.json();

        this.logger.logResponse(actualStatusCode, responseJSON);
        this.statusCodeValidator(actualStatusCode, statusCode, this.getRequest);
        this.resetFields();

        return responseJSON;
    }

    async postRequest(statusCode: number) {
        const url = this.getUrl();
        this.logger.logRequest('POST', url, this.apiHeaders, this.apiBody);
        const response = await this.request.post(url, {
            headers: this.apiHeaders,
            data: this.apiBody
        });
        const actualStatusCode = response.status();
        const responseJSON = await response.json();

        this.logger.logResponse(actualStatusCode, responseJSON);
        this.statusCodeValidator(actualStatusCode, statusCode, this.postRequest);
        this.resetFields();

        return responseJSON;
    }

    async putRequest(statusCode: number) {
        const url = this.getUrl();
        this.logger.logRequest('PUT', url, this.apiHeaders, this.apiBody);
        const response = await this.request.put(url, {
            headers: this.apiHeaders,
            data: this.apiBody
        });
        const actualStatusCode = response.status();
        const responseJSON = await response.json();

        this.logger.logResponse(actualStatusCode, responseJSON);
        this.statusCodeValidator(actualStatusCode, statusCode, this.putRequest);
        this.resetFields();

        return responseJSON;
    }

    async deleteRequest(statusCode: number) {
        const url = this.getUrl();
        this.logger.logRequest('DELETE', url, this.apiHeaders);
        const response = await this.request.delete(url, {
            headers: this.apiHeaders
        });
        const actualStatusCode = response.status();

        this.logger.logResponse(actualStatusCode);
        this.statusCodeValidator(actualStatusCode, statusCode, this.deleteRequest);
        this.resetFields();
    }

    private resetFields() {
        this.apiPath = '';
        this.queryParams = {};
        this.apiHeaders = {};
        this.apiBody = {};
        this.baseUrl = undefined;
    }

}