const { format, transports, createLogger } = require('winston');
const { combine, timestamp, printf } = format;
const date = require('date-and-time')

const primaryFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} - ${level}: ${message}`;
})

const getDateString = () => {
    const now = new Date();
    const formatStr = "YYYYMMDDTHH-mm-ss-SSZ";
    return date.format(now, formatStr);
}

const logger = createLogger({
    format: combine(
        timestamp(),
        primaryFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: `./Logging/${getDateString()}.primary.log` })
    ]
})

module.exports = {
    logger:logger
}