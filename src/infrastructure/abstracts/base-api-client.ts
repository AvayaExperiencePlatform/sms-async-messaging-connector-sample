import axios from 'axios';
import { Configuration } from "../types/types";

export default class BaseAPIClient {

    protected configuration;
    protected apiClient;

    constructor(configuration: Configuration) {
        this.configuration = configuration;
        this.apiClient = axios.create({
            baseURL: this.configuration.baseURL
        });
    }

    public async initClient(setAuthorization: Function, retryErrorCode?: number): Promise<void> {
        await setAuthorization();
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