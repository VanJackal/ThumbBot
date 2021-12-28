const {logger} = require('../../logging')
require('discord.js');

class Submission {
    constructor(id, body, userId, value = null) {
        this.id = id
        this.body = body
        this.userId = userId
        this.value = value
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
 */
exports.submitNew = (submitId, body, userId) => {
    const submission = new Submission(submitId, body, userId)

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
    const submission = new Submission(-1, "API Not Implemented", "", -1)
    return submission
}