import { AXPSendMessage, CPaaSSendMessage, IncomingMessage, NormalizedMessage } from './types';

export const normalizeAXPMessage = (message: IncomingMessage): NormalizedMessage => {
  return {
    message: {
      id: message.message.messageId,
      senderId: message.message.providerDialogId.split('_')[1],
      receiverId: message.message.providerDialogId.split('_')[0],
      receieverName: message.message.senderParticipantName,
      senderName: message.message.recipientParticipants[0]?.displayName,
      text: message.message.body.elementText.text,
      timestamp: message.message.receivedAt,
    },
    senderConfiguration: message.senderConfiguration,
    receiverConfiguration: message.receiverConfiguration,
  };
};

export const normalizeCPaaSMessage = (message: IncomingMessage): NormalizedMessage => {
  return {
    message: {
      id: message.message.SmsSid,
      senderId: message.message.From,
      senderName: message.message.From,
      receieverName: message.message.To,
      receiverId: message.message.To,
      text: message.message.Body,
      timestamp: message.message.Timestamp,
    },
    senderConfiguration: message.senderConfiguration,
    receiverConfiguration: message.receiverConfiguration,
  };
};

export const transformToAXPMessage = (message: NormalizedMessage): AXPSendMessage => {
  return {
    channelId: 'Messaging',
    channelProviderId: message.receiverConfiguration!!.providerId,
    businessAccountName: message.receiverConfiguration!!.integrationId,
    customerIdentifiers: {
      phoneNumbers: [message.message.senderId],
    },
    body: {
      elementType: 'text',
      elementText: {
        text: message.message.text,
        textFormat: 'PLAINTEXT',
      },
    },
    senderName: message.message.senderName,
    providerSenderId: message.message.senderId,
    providerDialogId: `${message.message.senderId}_${message.message.receiverId}`,
    providerMessageId: message.message.id,
    engagementParameters: { receipientId: message.message.receiverId },
  };
};

export const transformToCPaaSMessage = (message: NormalizedMessage): CPaaSSendMessage => {
  return {
    From: message.message.senderId,
    To: message.message.receiverId,
    Body: message.message.text,
  };
};
