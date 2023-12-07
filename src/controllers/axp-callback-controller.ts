import { Post, HttpCode, Controller, Body, Param, InternalServerError } from 'routing-controllers';
import { BaseController } from '../infrastructure/abstracts/base-controller';
import { Inject, Service } from 'typedi';
import AXPConnector from '../infrastructure/services/axp/axp-connector';
import CPaaSConnector from '../infrastructure/services/cpaas/cpaas-connector';
import { IncomingMessage } from '../infrastructure/types/types';
import BaseLogger from '../middleware/logger';

@Service()
@Controller('/axp/providers')
export class AXPCallbackController extends BaseController {
  private logger;
  public constructor(
    @Inject() private axpConnector: AXPConnector,
    @Inject() private cpaasConnector: CPaaSConnector,
  ) {
    super();
    this.logger = BaseLogger.child({ meta: { class: 'axp-callback-controller' } });
  }

  @Post('/:provider/callback')
  @HttpCode(200)
  public async callback(@Param('provider') provider, @Body() incomingMessage: IncomingMessage['message']) {
    try {
      this.logger.info(`Received AXP Callback Message`, { provider, incomingMessage });
      if (provider == 'cpaas') {
        const response = await this.axpConnector.messageCallbackHandler(this.buildMessage(incomingMessage), this.cpaasConnector.sendMessage.bind(this.cpaasConnector));
        this.logger.info(`Response received from AXP Callback Handler:`, { response });
        return { success: true, message: 'Message Processed to CPaaS' };
      } else return { success: false, message: 'Unknown connector type!' };
    } catch (error) {
      this.logger.error(`Error occured in AXP Callback Handler - `, error);
      throw new InternalServerError('Error occurred in callback handler');
    }
  }

  private buildMessage(incomingMessage: IncomingMessage['message']) {
    return {
      message: incomingMessage,
      senderConfiguration: this.axpConnector.getConfiguration(),
      receiverConfiguration: this.cpaasConnector.getConfiguration(),
    };
  }
}
