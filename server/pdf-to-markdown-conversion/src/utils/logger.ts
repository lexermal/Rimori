import pino from 'pino';
import { LOGGING_BACKEND_URL, LOGGING_PASSWORD, LOGGING_USERNAME } from './constants';

export const createLogger = (fileId: string) => {
  const logger = pino(pino.transport({
    targets: [
      {
        target: "pino-loki",
        options: {
          host: LOGGING_BACKEND_URL,
          labels: { job: 'pdf-converter' },
          basicAuth: {
            username: LOGGING_USERNAME,
            password: LOGGING_PASSWORD
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

  return {
    error: (message: string, meta?: Record<string, unknown>) => logger.error(meta, message),
    warn: (message: string, meta?: Record<string, unknown>) => logger.warn(meta, message),
    info: (message: string, meta?: Record<string, unknown>) => logger.info(meta, message),
    debug: (message: string, meta?: Record<string, unknown>) => logger.debug(meta, message),
    trace: (message: string, meta?: Record<string, unknown>) => logger.trace(meta, message),
  };
};
