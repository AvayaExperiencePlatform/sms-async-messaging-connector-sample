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
    this.initClient(this.acquireToken.bind(this), 401);
    this.logger.info(`Initialized AXPAPIClient with config`, this.configuration);
  }

  private async acquireToken() {
    const appTokenQueryParams = new URLSearchParams();
    appTokenQueryParams.append('grant_type', 'client_credentials');
    appTokenQueryParams.append('client_id', this.configuration.clientId);
    appTokenQueryParams.append('client_secret', this.configuration.clientSecret);

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Connection: 'keep-alive',
    };

    const response = await this.authClient.post(`/auth/realms/${this.configuration.accountId}/protocol/openid-connect/token`, appTokenQueryParams, { headers });
    this.apiClient.defaults.headers = {
      Authorization: `Bearer ${response.data.access_token}`,
      'Content-Type': `application/json`,
    } as any;
  }

  public async forceInit() {
    await this.acquireToken();
  }

  public async sendMessage(message: AXPSendMessage) {
    return await this.apiClient.post(`/api/digital/custom-messaging/${this.configuration.digitalAPIVersion}/accounts/${this.configuration.accountId}/messages`, message);
  }
}
