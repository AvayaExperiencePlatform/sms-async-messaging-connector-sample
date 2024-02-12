import * as dotenv from 'dotenv';
dotenv.config();
export let config = {
  appConfig: {
    port: process.env.PORT,
    baseURL: process.env.APP_BASE_URL,
    routePrefix: process.env.APP_BASE_ROUTE,
  },
  axpConfig: {
    baseURL: process.env.AXP_BASE_URL,
    apiAppKey: process.env.AXP_API_APP_KEY,
    accountId: process.env.AXP_ACCOUNT_ID,
    clientId: process.env.AXP_CLIENT_ID,
    clientSecret: process.env.AXP_CLIENT_SECRET,
    digitalAPIVersion: process.env.AXP_DIGITAL_API_VERSION,
    providerId: process.env.AXP_PROVIDER_ID,
    integrationId: process.env.AXP_INTEGRATION_ID,
  },
  cpaasConfig: {
    baseURL: process.env.CPAAS_BASE_URL,
    accountSID: process.env.CPAAS_ACCOUNT_SID,
    authToken: process.env.CPAAS_AUTH_TOKEN,
  },
} as any;
