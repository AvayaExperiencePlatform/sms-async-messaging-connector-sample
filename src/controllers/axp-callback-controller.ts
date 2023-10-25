import { Post, HttpCode, Controller, Body } from 'routing-controllers';
import { BaseController } from '../infrastructure/abstracts/base-controller';
import { Inject, Service } from 'typedi';
import { config } from '../config';
import AXPConnector from '../infrastructure/services/axp/axp-connector';
import CPaaSConnector from '../infrastructure/services/cpaas/cpaas-connector';
import { IncomingMessage } from '../infrastructure/types/types';
import logger from '../middleware/logger';

@Service()
@Controller('/axp')
export class AXPCallbackController extends BaseController {

    public constructor(@Inject() private axpConnector: AXPConnector, @Inject() private cpaasConnector: CPaaSConnector) {
        super();
    }


    @Post('/callback')
    @HttpCode(200)
    public async callback(@Body() incomingMessage: IncomingMessage["message"]) {
        logger.info(`Received AXP Callback Message ${JSON.stringify(incomingMessage)}`);
        await this.axpConnector.messageCallbackHandler(this.buildMessage(incomingMessage), this.cpaasConnector.sendMessage.bind(this.cpaasConnector));
        return { success: true, message: "Message Processed!" };
    }

    private buildMessage(incomingMessage: IncomingMessage["message"]) {
        return { message: incomingMessage, senderConfiguration: this.axpConnector.getConfiguration(), receiverConfiguration: this.cpaasConnector.getConfiguration() }
    }
}