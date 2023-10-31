import axios from 'axios';
import * as AxiosLogger from 'axios-logger';
import { Configuration } from "../types/types";

export default class BaseAPIClient {

    protected configuration;
    protected apiClient;
    protected authClient;

    constructor(configuration: Configuration) {
        this.configuration = configuration;
        this.apiClient = axios.create({
            baseURL: this.configuration.baseURL
        });
        this.authClient = axios.create({
            baseURL: this.configuration.baseURL
        });
    }

    public async initClient(setAuthorization: Function, retryErrorCode?: number): Promise<void> {
        await setAuthorization();
        if (process.env.LOG_OUTGOING_REQUESTS == "true")
            this.apiClient.interceptors.request.use(AxiosLogger.requestLogger, AxiosLogger.errorLogger);
        if (retryErrorCode != undefined)
            this.setInterceptors(setAuthorization, retryErrorCode);
    }

    private async setInterceptors(setAuthorization: Function, retryErrorCode: number): Promise<void> {

        this.apiClient.interceptors.response.use(
            (response: any) => {
                return response
            },
            async function (error: any) {
                console.log(error)
                const originalRequest = error.config;
                if (error.response.status === retryErrorCode && !originalRequest._retry) {
                    originalRequest._retry = true;
                    await setAuthorization();
                    return this.apiClient(originalRequest);
                }
                return Promise.reject(error)
            }
        );
    }

}