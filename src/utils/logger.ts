import pino from 'pino';
import { env } from './constants';

export const createLogger = (fileId: string) => {
    const logger = pino(pino.transport({
        targets: [
            {
                target: "pino-loki",
                options: {
                    host: env.LOGGING_BACKEND_URL,
                    labels: { job: 'rimori-app' },
                    basicAuth: {
                        username: env.LOGGING_USERNAME,
                        password: env.LOGGING_PASSWORD
                    }
                }
            },
            {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    messageFormat: `[${fileId}] {msg}`,
                    translateTime: 'yyyy.mm.dd HH:MM:ss.l',
                    ignore: 'pid,hostname',
                    singleLine: true
                }
            }
        ],
    }));

    logger.debug(`Logger created for ${fileId}`);

    return {
        error: (message: string, meta?: Record<string, unknown>) => logger.error(meta, message),
        warn: (message: string, meta?: Record<string, unknown>) => logger.warn(meta, message),
        info: (message: string, meta?: Record<string, unknown>) => logger.info(meta, message),
        debug: (message: string, meta?: Record<string, unknown>) => logger.debug(meta, message),
        trace: (message: string, meta?: Record<string, unknown>) => logger.trace(meta, message),
    };
};
