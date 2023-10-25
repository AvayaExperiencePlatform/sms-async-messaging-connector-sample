import AbstractConnector from "../../../infrastructure/abstracts/abstract-connector";
import CPaaSAPIClient from "./cpaas-api-client";
import { normalizeCPaaSMessage, transformToCPaaSMessage } from "../../../infrastructure/types/transformers";
import { Configuration, IncomingMessage, NormalizedMessage } from "../../../infrastructure/types/types";
import { Service } from "typedi";
import { config } from "../../../config";
import logger from '../../../middleware/logger';

@Service()
export default class CPaaSConnector implements AbstractConnector {

    private configuration: Configuration;
    private apiClient: CPaaSAPIClient;
    constructor(configuration?: Configuration) {
        this.configuration = configuration || config.cpaasConfig;
        this.apiClient = new CPaaSAPIClient(this.configuration);
    }

    public async sendMessage(message: NormalizedMessage): Promise<NormalizedMessage> {
        logger.info(`Sending normalized message to CPaaS: ${JSON.stringify(message)}`);

        const cpaasMessage = transformToCPaaSMessage(message);     

        logger.info(`Transformed normalized message to CPaaS Fromat: ${JSON.stringify(cpaasMessage)}`);

        const sentMessage = await this.apiClient.sendMessage(cpaasMessage);
        console.log(sentMessage.data);
        return message;
    };
    
    public async messageCallbackHandler(incomingMessage: IncomingMessage, callback: Function): Promise<void> {
        const normalizedMessage = normalizeCPaaSMessage(incomingMessage);
        logger.info(`Normalized incoming CPaaS message to: ${JSON.stringify(normalizedMessage)}`);
        return callback(normalizedMessage)
    };

    public getConfiguration(): Configuration {
        return this.configuration;
    }
}
