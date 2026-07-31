import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const options: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
};

if (!isProduction) {
  options.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  };
}

const logger = pino(options);

export default logger;
