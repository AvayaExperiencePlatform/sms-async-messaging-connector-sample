import axios, { AxiosInstance } from 'axios';
import * as AxiosLogger from 'axios-logger';
import { Configuration, InitAPIClientParams } from '../types/types';

export default class BaseAPIClient {
  protected configuration: Configuration;
  protected apiClient: AxiosInstance;
  protected authClient: AxiosInstance;
  protected isInitialized: boolean = false;

  constructor(configuration: Configuration) {
    this.configuration = configuration;
    this.apiClient = axios.create({
      baseURL: this.configuration.baseURL,
    });
    this.authClient = axios.create({
      baseURL: this.configuration.baseURL,
    });
  }

  public async initClient({ setAuthorization, acquireToken, retryErrorCode }: InitAPIClientParams): Promise<void> {
    if (process.env.LOG_OUTGOING_REQUESTS == 'true') this.apiClient.interceptors.request.use(AxiosLogger.requestLogger as any, AxiosLogger.errorLogger);
    if (retryErrorCode != undefined && acquireToken != undefined) this.setInterceptors(acquireToken, retryErrorCode);
    if (setAuthorization != undefined) await setAuthorization();
    this.isInitialized = true;
  }

  public isInitComplete() {
    return this.isInitialized;
  }

  protected async setInterceptors(acquireToken: Function, retryErrorCode: number): Promise<void> {
    this.apiClient.interceptors.response.use(
      (response: any) => {
        AxiosLogger.responseLogger(response);
        return response;
      },
      async function (error: any) {
        console.error('error: Error received for request...');
        const originalRequest = error.config;
        if (error.response.status === retryErrorCode && !originalRequest._retry) {
          console.warn('warn: Status code 401 received, retrying..');
          originalRequest._retry = true;
          const { access_token } = await acquireToken();
          const headers = {
            ...this.apiClient.defaults.headers,
            Authorization: `Bearer ${access_token}`,
            'Content-Type': `application/json`,
          } as any;
          this.apiClient.defaults.headers = headers;
          originalRequest.headers = headers;
          return this.apiClient(originalRequest);
        }
        return Promise.reject(error);
      }.bind(this),
    );
  }
}
