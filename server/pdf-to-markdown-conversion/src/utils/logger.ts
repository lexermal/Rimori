import winston from 'winston';

export const createLogger = (fileId: string) => {
  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.splat(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const additionalParams = Object.values(meta).join('');
        const logEntry = `[${timestamp}] [${fileId}] [${level}]: ${message} ${additionalParams}`;
        return winston.format.colorize().colorize(level, logEntry);
      })
    ),
    transports: [
      new winston.transports.Console()
    ]
  });

  return logger;
};