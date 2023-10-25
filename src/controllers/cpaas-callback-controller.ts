import { Post, HttpCode, Controller, Body, Param } from 'routing-controllers';
import { BaseController } from '../infrastructure/abstracts/base-controller';
import { Inject, Service } from 'typedi';
import AXPConnector from '../infrastructure/services/axp/axp-connector';
import CPaaSConnector from '../infrastructure/services/cpaas/cpaas-connector';
import { IncomingMessage } from '../infrastructure/types/types';
import logger from '../middleware/logger';

@Service()
@Controller('/cpaas/numbers')
export class CPaaSCallbackController extends BaseController {

    public constructor(@Inject() private cpaasConnector: CPaaSConnector, @Inject() private axpConnector: AXPConnector) {
        super();
    }


    @Post(':number/callback')
    @HttpCode(200)
    public async callback(@Param('number') inboundNumber, @Body() incomingMessage: IncomingMessage["message"]) {
        logger.info(`Received CPaaS Callback Message ${JSON.stringify(incomingMessage)}`);
        if (`+${inboundNumber}` != incomingMessage.To) {
            logger.warn(`Message Dropped! It's not matching the inbound number callback param, this is likely an outbound message.`)
            return { success: true, message: "Message Dropped!" };
        }
        await this.cpaasConnector.messageCallbackHandler(this.buildMessage(incomingMessage), this.axpConnector.sendMessage.bind(this.axpConnector));
        return { success: true, message: "Message Processed!" };
    }

    private buildMessage(incomingMessage: IncomingMessage["message"]) {
        return { message: incomingMessage, senderConfiguration: this.cpaasConnector.getConfiguration(), receiverConfiguration: this.axpConnector.getConfiguration() }
    }
}