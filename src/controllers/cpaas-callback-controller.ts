import { Post, HttpCode, Controller, Body, Param } from 'routing-controllers';
import { BaseController } from '../infrastructure/abstracts/base-controller';
import { Inject, Service } from 'typedi';
import AXPConnector from '../infrastructure/services/axp/axp-connector';
import CPaaSConnector from '../infrastructure/services/cpaas/cpaas-connector';
import { IncomingMessage } from '../infrastructure/types/types';
import BaseLogger from '../middleware/logger';

@Service()
@Controller('/cpaas/numbers')
export class CPaaSCallbackController extends BaseController {

    private logger;

    public constructor(@Inject() private cpaasConnector: CPaaSConnector, @Inject() private axpConnector: AXPConnector) {
        super();
        this.logger = BaseLogger.child({ meta: { service: 'cpaas-callback-controller' } });
    }

    @Post('/:number/callback')
    @HttpCode(200)
    public async callback(@Param('number') inboundNumber, @Body() incomingMessage: IncomingMessage["message"]) {
        try {
            this.logger.info(`Received CPaaS Callback Message`, { inboundNumber, incomingMessage });
            if (`+${inboundNumber}` != incomingMessage.To) {
                this.logger.warn(`Message Dropped! It's not matching the inbound number callback param, this is likely an outbound message.`)
                return { success: true, message: "Message Dropped!" };
            }
            const response = await this.cpaasConnector.messageCallbackHandler(this.buildMessage(incomingMessage), this.axpConnector.sendMessage.bind(this.axpConnector));
            this.logger.info(`Response received from CPaaS Callback Handler`, { response })
            return { success: true, message: "Message Processed!" };
        } catch (error) {
            this.logger.error(`Error occured in CPaaS Callback Handler - `, error)
        }
    }

    private buildMessage(incomingMessage: IncomingMessage["message"]) {
        return { message: incomingMessage, senderConfiguration: this.cpaasConnector.getConfiguration(), receiverConfiguration: this.axpConnector.getConfiguration() }
    }
}