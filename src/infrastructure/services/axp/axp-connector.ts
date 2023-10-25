import AbstractConnector from "../../../infrastructure/abstracts/abstract-connector";
import AXPAPIClient from "./axp-api-client";
import logger from '../../../middleware/logger';
import { normalizeAXPMessage, transformToAXPMessage } from "../../..//infrastructure/types/transformers";
import { Configuration, IncomingMessage, NormalizedMessage } from "../../../infrastructure/types/types";
import { Service } from "typedi";
import { config } from "../../../config";

@Service()
export default class AXPConnector implements AbstractConnector {

    private configuration: Configuration;
    private apiClient: AXPAPIClient;

    constructor(configuration?: Configuration) {
        this.configuration = configuration || config.axpConfig;
        this.apiClient = new AXPAPIClient(this.configuration);
        logger.info(`Initialized AXPConnector with config ${this.configuration}`);
    }

    public async sendMessage(message: NormalizedMessage): Promise<NormalizedMessage> {
        logger.info(`Sending normalized message to AXP: ${JSON.stringify(message)}`);

        const axpMessage = transformToAXPMessage(message);
        logger.info(`Transformed normalized message to AXP Fromat: ${JSON.stringify(axpMessage)}`);
        const sentMessage = await this.apiClient.sendMessage(axpMessage);
        console.log(sentMessage.data);
        return message;
    };

    public async messageCallbackHandler(incomingMessage: IncomingMessage, callback: Function): Promise<void> {
        if (incomingMessage.message.senderParticipantType == "CUSTOMER") {
            logger.info('Dropping incoming AXP message as it is sent by CUSTOMER participant type')
            return;
        }
        
        if(incomingMessage.message.eventType != "MESSAGES"){
            logger.info('Dropping incoming AXP event as it is not of type MESSAGESD')
            return;
        }

        const normalizedMessage = normalizeAXPMessage(incomingMessage);
        logger.info(`Normalized incoming AXP message to: ${JSON.stringify(normalizedMessage)}`);

        return await callback(normalizedMessage)
    };

    public getConfiguration(): Configuration {
        return this.configuration;
    }
}
