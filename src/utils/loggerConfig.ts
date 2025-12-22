import winston, { Logger } from 'winston'

export class WinstonConfig {
  private setFormatOfLogger() {
    const settings = [
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.json(),
    ]
    if (process.env.NODE_ENV === 'local') {
      settings.pop()
      settings.unshift(
        winston.format.colorize({
          all: true,
        }),
      )
      settings.push(
        winston.format.printf((info) => {
          const context = !info.context
            ? ''
            : ` | context: ${JSON.stringify(info.context)}`
          const error = !info.error
            ? ''
            : ` | error: ${JSON.stringify(info.error)}`
          return `[${info.timestamp}] | ${info.level}: ${info.message} | class name: ${info.className} ${context} ${error}`
        }),
      )
    }
    return winston.format.combine(...settings)
  }

  createLogger(className: string): Logger {
    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
    }

    const transports = [new winston.transports.Console()]
    return winston.createLogger({
      level: process.env.LOGGER_LEVEL,
      format: this.setFormatOfLogger(),
      levels,
      transports,
      defaultMeta: {
        serviceName: process.env.LOGGER_SERVICE_NAME,
        className,
      },
    })
  }
}

export class WinstonLoggerBuild {
  public static buildObjectLogger(
    message: string,
    context?: object,
    error?: unknown,
  ): object {
    return {
      message,
      context,
      error,
    }
  }
}
