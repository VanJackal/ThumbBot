const {logger} = require('../../logging')
require('discord.js');

class Submission {
    constructor(id, body, userId, timestamp, value = null) {
        this.id = id
        this.body = body
        this.userId = userId
        this.value = value
        this.timestamp = timestamp
        this.flagged = false
        this.pending = false
        this.verified = false
    }
}

/**
 * Verify the value currently pending in a submission
 *
 * @param {*} submitId snowflake of the submission
 */
exports.verifySubmission = (submitId) => {
    logger.info(`Verified Submission #${submitId}`)
    logger.warn("verifySubmission - NotImplemented")
}

/**
 * submit a new message/submission to the api
 *
 * @param {*} submitId discord snowflake of the submission message
 * @param {string} body body of the submission message
 * @param {*} userId discord user snowflake
 * @param submitTime
 */
exports.submitNew = (submitId, body, userId, submitTime) => {
    const submission = new Submission(submitId, body, userId,submitTime)

    logger.info(`New Submission Created - user:${userId} submitId:${submitId} body:${body}`)
    logger.warn("submitNew - NotImplemented")
}

/**
 * Add data to a submission about the actual score values pending full verification
 *
 * @param {*} submitId discord snowflake of the submission message
 * @param {*} data
 */
exports.submitData = (submitId, data) => {
    logger.info(`Added Data Pending Verification - submitId:${submitId} data:${data}`)
    logger.warn("submitData - NotImplemented")
}

/**
 * Get a Submission from its id
 *
 * @param {*} submitId
 * @returns {Submission}
 */
exports.getSubmission = (submitId) => {
    logger.info(`Getting Submission[${submitId}]`)
    logger.warn("getSubmission - NotImplemented")
    const submission = new Submission(-1, "API Not Implemented", "153227917084721153","Sometime", -1)
    return submission
}

exports.flagSubmission = (submissionId) => {
    logger.info(`Flagging Submission[${submissionId}]`)
    logger.warn("flagSubmission - NotImplemented")
}

exports.denyPending = (submissionId) => {
    logger.info(`Denying pending value for Submission[${submissionId}]`)
    logger.warn("denyPending - NotImplemented")
}

