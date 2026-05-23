import { expect as baseExpect } from '@playwright/test';
import { APILogger } from './logger';

let apiLogger: APILogger;

export const setCustomExpectLogger = (logger: APILogger) => {
    apiLogger = logger;
};

declare global {
    namespace PlaywrightTest {
        interface Matchers<R, T> {
            shouldBe(expected: T): R;
        }
    }
}

export const expect = baseExpect.extend({
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

    }




});