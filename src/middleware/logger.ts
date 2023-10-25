import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.json(),
    defaultMeta: { service: process.env.APP_NAME || 'SMS-AXP-CONNECTOR' },
    transports: [

    ],
    exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
});

if (process.env.LOG_TO_CONSOLE == "true") {
    logger.add(new transports.Console({
        format: format.simple(),
    }))
}

if (process.env.LOG_TO_FILE == "true")
    logger.add(
        new transports.File({ filename: '.logs/error.log', level: 'error' })
    ) && logger.add(
        new transports.File({ filename: '.logs/status.log' }))

export default logger;
