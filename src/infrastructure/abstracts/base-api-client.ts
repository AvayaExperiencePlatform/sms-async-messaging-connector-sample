import axios, { AxiosInstance } from 'axios';
import * as AxiosLogger from 'axios-logger';
import { Configuration } from '../types/types';

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

  public async initClient(setAuthorization: Function, retryErrorCode?: number): Promise<void> {
    if (process.env.LOG_OUTGOING_REQUESTS == 'true') this.apiClient.interceptors.request.use(AxiosLogger.requestLogger as any, AxiosLogger.errorLogger);
    if (retryErrorCode != undefined) this.setInterceptors(setAuthorization, retryErrorCode);
    await setAuthorization();
    this.isInitialized = true;
  }

  public isInitComplete() {
    return this.isInitialized;
  }

  protected async setInterceptors(setAuthorization: Function, retryErrorCode: number): Promise<void> {
    this.apiClient.interceptors.response.use(
      (response: any) => {
        AxiosLogger.responseLogger(response);
        return response;
      },
      async function (error: any) {
        console.warn('Error received for request...');
        const originalRequest = error.config;
        if (error.response.status === retryErrorCode && !originalRequest._retry) {
          originalRequest._retry = true;
          await setAuthorization();
          console.warn('Status code 401 received, retrying..');
          return this.apiClient(originalRequest);
        }
        return Promise.reject(error);
      }.bind(this),
    );
  }
}
