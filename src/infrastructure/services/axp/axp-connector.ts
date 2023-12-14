import AbstractConnector from '../../../infrastructure/abstracts/abstract-connector';
import AXPAPIClient from './axp-api-client';
import BaseLogger from '../../../middleware/logger';
import { normalizeAXPMessage, transformToAXPMessage } from '../../..//infrastructure/types/transformers';
import { Configuration, IncomingMessage, NormalizedMessage } from '../../../infrastructure/types/types';
import { Service } from 'typedi';
import { config } from '../../../config';

@Service()
export default class AXPConnector implements AbstractConnector {
  private configuration: Configuration;
  private apiClient: AXPAPIClient;
  private logger;
  constructor(configuration?: Configuration) {
    this.configuration = configuration || config.axpConfig;
    this.logger = BaseLogger.child({ meta: { service: 'axp-connector' } });
    this.apiClient = new AXPAPIClient(this.configuration);
    this.logger.info(`Initialized AXPConnector with config `, this.configuration);
  }

  public async sendMessage(message: NormalizedMessage): Promise<NormalizedMessage> {
    this.logger.info(`Sending normalized message to AXP: `, message);
    const axpMessage = transformToAXPMessage(message);
    this.logger.info(`Transformed normalized message to AXP Fromat: `, axpMessage);
    const sentMessage = await this.apiClient.sendMessage(axpMessage);
    this.logger.info(`Request sent to AXP and response data received: `, sentMessage.data);
    return message;
  }

  public async messageCallbackHandler(incomingMessage: IncomingMessage, callback: Function): Promise<void> {
    if (incomingMessage.message.senderParticipantType == 'CUSTOMER') {
      this.logger.warn(`Dropping incoming AXP message as it is sent by CUSTOMER participant type`);
      return;
    }

    if (incomingMessage.message.eventType != 'MESSAGES') {
      this.logger.warn(`Dropping incoming AXP event as it is not of type MESSAGES`);
      return;
    }

    const normalizedMessage = normalizeAXPMessage(incomingMessage);
    this.logger.info(`Normalized incoming AXP message to: `, normalizedMessage);
    return await callback(normalizedMessage);
  }

  public getConfiguration(): Configuration {
    return this.configuration;
  }
}
