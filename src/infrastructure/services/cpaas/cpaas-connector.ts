import AbstractConnector from '../../../infrastructure/abstracts/abstract-connector';
import CPaaSAPIClient from './cpaas-api-client';
import { normalizeCPaaSMessage, transformToCPaaSMessage } from '../../../infrastructure/types/transformers';
import { Configuration, IncomingMessage, NormalizedMessage } from '../../../infrastructure/types/types';
import { Service } from 'typedi';
import { config } from '../../../config';
import BaseLogger from '../../../middleware/logger';

@Service()
export default class CPaaSConnector implements AbstractConnector {
  private configuration: Configuration;
  private apiClient: CPaaSAPIClient;
  private logger;
  constructor(configuration?: Configuration) {
    this.logger = BaseLogger.child({ meta: { service: 'cpaas-connector' } });
    this.configuration = configuration || config.cpaasConfig;
    this.apiClient = new CPaaSAPIClient(this.configuration);
  }

  public async sendMessage(message: NormalizedMessage): Promise<NormalizedMessage> {
    this.logger.info(`Sending normalized message to CPaaS: `, message);

    const cpaasMessage = transformToCPaaSMessage(message);
    this.logger.info(`Transformed normalized message to CPaaS Fromat: `, cpaasMessage);

    const sentMessage = await this.apiClient.sendMessage(cpaasMessage);
    this.logger.info(`Send Message request sent to CPaaS and response data received: `, sentMessage.data);

    return message;
  }

  public async messageCallbackHandler(incomingMessage: IncomingMessage, callback: Function): Promise<void> {
    const normalizedMessage = normalizeCPaaSMessage(incomingMessage);
    this.logger.info(`Normalized incoming CPaaS message to: `, normalizedMessage);

    return callback(normalizedMessage);
  }

  public getConfiguration(): Configuration {
    return this.configuration;
  }
}
