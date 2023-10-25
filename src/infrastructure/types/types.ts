
export type IncomingMessage = {
    message: AXPIncomingMessage & CPaaSIncomingMessage;
    senderConfiguration: Configuration;
    receiverConfiguration: Configuration;
}

export type NormalizedMessage = {
    message: {
        id: string,
        receiverIntegrationId?: string;
        senderId: string;
        senderName: string;
        receieverName?: string;
        receiverId: string;
        text: string;
        timestamp: string;
    }
    senderConfiguration?: Configuration;
    receiverConfiguration?: Configuration;
}

export type AXPConfiguration = {
    baseURL: string;
    accountId: string;
    clientId: string;
    clientSecret: string;
    digitalAPIVersion: string;
    providerId: string;
    integrationId: string;
}

export type CPaaSConfiguration = {
    baseURL: string;
    accountSID: string;
    authToken: string;
}

export type Configuration = AXPConfiguration & CPaaSConfiguration;

export type AXPIncomingMessage = {
    eventType: "MESSAGES",
    correlationId: string,
    eventDate: string,
    messageId: string,
    accountId: string,
    dialogId: string,
    engagementId: string,
    status: string,
    sessionId?: string,
    businessAccountName: string,
    channelProviderId: string,
    channelId: "Messaging",
    senderParticipantId: string,
    senderParticipantName: string,
    senderParticipantType: "CUSTOMER" | "AGENT" | "SYSTEM",
    body?: {
        elementType: "text",
        elementText: {
            text: string,
            textFormat: "PLAINTEXT"
        }
    },
    customData?: object,
    messageIndex: number,
    recipientParticipants: {
        participantId: string,
        connectionId: string,
        displayName: string,
        participantType: "CUSTOMER" | "AGENT",
        providerParticipantId: string,
        channelProviderId: string,
    }[],
    providerDialogId: string,
    providerSenderId: string,
    receivedAt: string,
    lastUpdatedAt: string

}

export type CPaaSIncomingMessage = {
    AccountSid?: string;
    ApiVersion?: string;
    To?: string;
    From?: string;
    SmsSid?: string;
    SmsStatus?: string;
    Body?: string;
    DlrStatus?: string;
    ErrorMessage?: string;
    Price?: string;
    Timestamp?: string;
}

export type AXPSendMessage = {
    channelId: "Messaging";
    channelProviderId: string;
    businessAccountName: string;
    customerIdentifiers?: {
        emailAddresses?: string[];
        phoneNumbers?: string[];
    };
    body: {
        elementType: "text";
        elementText: {
            text: string;
            textFormat: "PLAINTEXT"
        }
    };
    senderName: string;
    providerSenderId: string;
    providerDialogId?: string;
    providerMessageId?: string;
    customData?: object;
    engagementParameters?: object;
}

export type CPaaSSendMessage = {
    From: string;
    To: string;
    Body: string;
}