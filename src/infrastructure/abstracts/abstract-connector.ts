import { NormalizedMessage, IncomingMessage } from '../types/types';

export default abstract class AbstractConnector {
  abstract sendMessage(message: NormalizedMessage): void;
  abstract messageCallbackHandler(incomingMessage: IncomingMessage, callback: Function): void;
  abstract getConfiguration(): void;
}
