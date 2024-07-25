import winston from 'winston';

export const createLogger = (fileId: string) => {
  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] [${fileId}] [${level.toUpperCase()}]: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console()
    ]
  });

  return logger;
};
