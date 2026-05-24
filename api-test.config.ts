const processEnv = process.env.TEST_ENV;
const env = processEnv || 'qa';
console.log(`Test Environment ==> ${env}`);

const config = {
    apiURL: 'https://conduit-api.bondaracademy.com/api',
    userEmail: 'msstest2026@example.com',
    userPassword: 'Test123!'
}

if (env === 'qa') {
    config.apiURL = 'https://conduit-api.bondaracademy.com/api';
    config.userEmail = 'msstest2026@example.com';
    config.userPassword = 'Test123!';
}

if (env === 'prod') {
    config.apiURL = 'https://conduit-api.bondaracademy.com/api';
    config.userEmail = 'msstest2026@example.com';
    config.userPassword = 'Test123!';
}

export {config};