import BaseAPIClient from '../../abstracts/base-api-client';
import { CPaaSSendMessage, Configuration } from '../../types/types';

export default class CPaaSAPIClient extends BaseAPIClient {
  constructor(configuration: Configuration) {
    super(configuration);
    this.initClient({ setAuthorization: this.setToken.bind(this) });
  }

  public async setToken() {
    this.apiClient.defaults.auth = { username: this.configuration.accountSID, password: this.configuration.authToken };
    this.apiClient.defaults.headers['Content-Type'] = `application/x-www-form-urlencoded`;
  }

  public async sendMessage(message: CPaaSSendMessage) {
    const messageParams = new URLSearchParams();
    messageParams.append('From', message.From);
    messageParams.append('To', message.To);
    messageParams.append('Body', message.Body);
    return await this.apiClient.post(`/Accounts/${this.configuration.accountSID}/SMS/Messages.json`, message);
  }
}
