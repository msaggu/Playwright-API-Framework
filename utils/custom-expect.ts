import { expect as baseExpect } from '@playwright/test';
import { APILogger } from './logger';
import { validateSchema } from './schema-validator';

let apiLogger: APILogger;

export const setCustomExpectLogger = (logger: APILogger) => {
    apiLogger = logger;
};

declare global {
    namespace PlaywrightTest {
        interface Matchers<R, T> {
            shouldBe(expected: T): R;
            toMatchSchema(dirName: string, fileName: string): Promise<R>;
        }
    }
}

export const expect = baseExpect.extend({

    async toMatchSchema(received: object, dirName: string, fileName: string) {
        try {
            await validateSchema(dirName, fileName, received);
            return {
                message: () => `Expected response NOT to match schema ${fileName}`,
                pass: true,
            };
        } catch (error: any) {
            return {
                message: () => `Schema validation failed for ${fileName}:\n${error.message}`,
                pass: false,
            };
        }
    },

    shouldBe(received: any, expected: any) {
        let pass: boolean;
        let logs: string = '';

        try {
            baseExpect(received).toBe(expected);
            pass = true;
            if (this.isNot) {
                logs = apiLogger.getRecentLogs();
            }
        } catch (e: any) {
            pass = false;
            logs = apiLogger.getRecentLogs();
        }

        const hint = this.isNot ? 'not' : '';
        const message = this.utils.matcherHint('shouldBe', undefined, undefined, { isNot: this.isNot }) +
            '\n\n' +
            `Expected: ${hint} ${this.utils.printExpected(expected)}\n` +
            `Received: ${this.utils.printReceived(received)}\n\n` +
            `Recent API Activity: \n${logs}`;

        return {
            message: () => message,
            pass,
        };

    },

});