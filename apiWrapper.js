const { logger } = require('./logging')

/**
 * Verify the value currently pending in a submission
 * 
 * @param {int} submitId snowflake of the submission
 */
const verifySubmission = (submitId) => {
    logger.info(`Verified Submission #${submitId}`)
    logger.warn("verifySubmission - NotImplemented")
}

/**
 * submit a new message/submission to the api
 * 
 * @param {int} submitId discord snowflake of the submission message
 * @param {string} body body of the submission message
 * @param {int} userId discord user snowflake
 */
const submitNew = (submitId, body, userId) => {
    logger.info(`New Submission Created - user:${userId} submitId:${submitId} body:${body}`)
    logger.warn("submitNew - NotImplemented")
}

/**
 * Add data to a submission about the actual score values pending full verification
 * 
 * @param {integer} submitId discord snowflake of the submission message
 * @param {*} data 
 */
const submitData = (submitId, data) => {
    logger.info(`Added Data Pending Verification - submitId:${submitId} data:${data}`)
    logger.warn("submitData - NotImplemented")
}