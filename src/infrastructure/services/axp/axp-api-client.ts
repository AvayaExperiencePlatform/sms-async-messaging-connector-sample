import BaseAPIClient from '../../abstracts/base-api-client';
import { AXPSendMessage, Configuration } from '../../types/types';
import BaseLogger from '../../../middleware/logger';
import { AxiosInstance } from 'axios';

export default class AXPAPIClient extends BaseAPIClient {
  protected configuration: Configuration;
  protected apiClient: AxiosInstance;
  protected logger: any;

  constructor(configuration: Configuration) {
    super(configuration);
    this.logger = BaseLogger.child({ meta: { service: 'axp-api-client' } });
    this.initClient({ acquireToken: this.acquireToken.bind(this), setAuthorization: this.setAppKey.bind(this), retryErrorCode: 401 });
    this.logger.info(`Initialized AXPAPIClient with config`, this.configuration);
  }

  private async acquireToken(): Promise<{ access_token: string }> {
    const appTokenQueryParams = new URLSearchParams();
    appTokenQueryParams.append('grant_type', 'client_credentials');
    appTokenQueryParams.append('client_id', this.configuration.clientId);
    appTokenQueryParams.append('client_secret', this.configuration.clientSecret);

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Connection': 'keep-alive',
      'appkey': this.configuration.apiAppKey
    };

    this.logger.info('Attempting to acquire new access token...')
    const response = await this.authClient.post(`/api/auth/v1/${this.configuration.accountId}/protocol/openid-connect/token`, appTokenQueryParams, { headers });
    this.logger.info('Success! New access token has been acquired...')

    return response.data;
  }

  private setAppKey(): void {
    this.apiClient.defaults.headers['appkey'] = this.configuration.apiAppKey;
  }

  public async sendMessage(message: AXPSendMessage) {
    return await this.apiClient.post(`/api/digital/custom-messaging/${this.configuration.digitalAPIVersion}/accounts/${this.configuration.accountId}/messages`, message);
  }
}
