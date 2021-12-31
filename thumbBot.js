const Discord = require("discord.js");
const {logger} = require('./logging')

const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'DIRECT_MESSAGES']
const client = new Discord.Client({intents: intents});

const config = require("./config.json");
const TOKEN = require("./token.json").TOKEN;
const {API} = require("./util")

const EMBED_VERIFY_COLOR = "#00ff7b"

logger.info("Startup")

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (userIsThumbBot(message.author.id)) return;
    const member = await getGuildMember(message.author.id);
    if (!member) return;
    switch (message.channelId) {
        case config.channelVerify:
            logger.log('trace', "Message Creation Switch Verify")
            if (memberHasRole(config.adminRole, member)) await processVerifyMessage(message)
            break
        case config.channelSubmit:
            logger.log('trace', "Message Creation Switch Submit")
            if (memberHasRole(config.playerRole, member)) await processSubmission(message)
            break
        default:
            break
    }
})

/**
 *
 * @param {Discord.ButtonInteraction} buttonInteraction
 */
async function disableButtons(buttonInteraction) {
    const rows = buttonInteraction.message.components
    logger.debug(`Disabling Buttons for message[${buttonInteraction.message.id}]`)
    rows.forEach(row => {
        row.components.forEach( comp => {
            if (comp.type === "BUTTON"){
                logger.log('trace', `Disabling button[${comp.customId}] on message[${buttonInteraction.message.id}]`)
                comp.setDisabled(true)
            }
        })
    })
    //await buttonInteraction.update({components:rows})//TODO get this working
}

async function processVerifyButton(interaction) {
    const submissionId = interaction.message.reference.messageId
    logger.info(`buttonVerify called on submission - ${submissionId}`)
    API.verifySubmission(submissionId)
    const value = API.getSubmission(submissionId).value
    const content = `\`${value}\` has been verified for submission \`${submissionId}\``
    interaction.reply(content)
    await disableButtons(interaction)
}

async function processFlagButton(interaction) {
    const submissionId = interaction.message.id
    logger.info(`buttonFlag called on submission - ${submissionId}`)
    API.flagSubmission(submissionId)
    const submission = API.getSubmission(submissionId)
    const content = `Your submission \`${submissionId} - submitted on: {datetime}\` has been flagged for review, please contact a moderator.`
    await messageUser(submission.userId,content)
    interaction.reply({content:`Submission \`${submissionId}\` Flagged, <@${submission.userId}> has been notified of the flagged submission.`})
}

/**
 * Process Buttons
 */
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    switch (interaction.customId) {
        case "buttonVerify":
            await processVerifyButton(interaction);
            break
        case "buttonFlag":
            await processFlagButton(interaction);
            break
        default:
            logger.log('warn', `ButtonId ${interaction.customId} called but not implemented.`)
            await interaction.reply({ephemeral:true,content:`Button *${interaction.customId}* is either not implemented or something is very broken **contact an admin**.`})
            break
    }
})

const processSubmission = async (message) => {
    logger.debug(`Processing Submission - msgid:${message.id} content:\"${message.content}\"`)
    const submission = await forwardMsgToVerify(message);
    API.submitNew(submission.id, message.content, message.author.id, message.createdTimestamp)
    message.delete().then(msg => logger.debug(`Deleted Submission Message - msgid:${msg.id}`));
}

function getSubmissionEmbed(message) {
    const attach = getAttachmentsEmbed(message.attachments)

    return new Discord.MessageEmbed()
        .setAuthor(`${message.author.tag} - (${message.author.id})`)
        .addField("Message Content", message.content)
        .addFields(attach)
        .setColor(EMBED_VERIFY_COLOR)
        .setTimestamp()
        .setFooter('ThumbBot Verification');//Todo add Icon for thumbBot to this
}

function getSubmissionButtons() {
    let comp = new Discord.MessageActionRow()
    comp.addComponents(new Discord.MessageButton({label: "Flag", customId: "buttonFlag", style: "DANGER"}))
    return comp
}

const forwardMsgToVerify = async (message) => {
    logger.debug(`Forwarding Submission to Verify - msgid:${message.id}`)

    const channel = await client.channels.fetch(config.channelVerify);
    const embed = getSubmissionEmbed(message);
    const buttons = getSubmissionButtons();

    logger.log("trace", `Sending ${message.id} to Verify Channel`);
    const newMsg = await channel.send({embeds: [embed], components:[buttons]});
    logger.debug(`Submission sent to Verify - msgid:${message.id} -> ${newMsg.id}`)
    return newMsg
}

const processVerifyMessage = async (message) => {
    const submitId = message.reference?.messageId
    if (!submitId) return;
    const submission = API.getSubmission(submitId)
    const submitValue = parseInt(message.content)

    if (!submission) {
        logger.log('debug', `Message[${submitId}] id not a submission (not found in DB)`)
        await message.reply(`The message you replied to is not a submission.`)
    } else if (isNaN(submitValue)) {
        logger.log('debug', `VerifyProcessing Invalid Submission Value - \"${message.content}\"`)
        await message.reply(`\"${message.content}\" is not a valid submission value.`)
    } else {
        API.submitData(submitId, submitValue)
        await sendVerifyMessage(message)
    }
}

async function sendVerifyMessage(message) {
    const channel = message.channel
    const submission = await channel.messages.fetch(message.reference.messageId)

    let comp = new Discord.MessageActionRow()
    comp.addComponents(new Discord.MessageButton({label: "Verify", customId: "buttonVerify", style: "PRIMARY"}))

    await submission.reply({
        content: `Verify the value \`${message.content}\` for this submission?`,
        components: [comp]
    })
}

const memberHasRole = (roleId, member) => {
    logger.log('trace', `memberHasRole call - member: ${member.id} role: ${roleId}`)
    return member.roles.cache.has(roleId)
}

/**
 *
 * @param {Discord.UserResolvable} userId
 * @returns {Discord.GuildMember}
 */
const getGuildMember = async (userId) => {
    const guild = await client.guilds.fetch(config.guild)
    return await guild.members.fetch(userId)
}

const userIsThumbBot = (userId) => {
    return client.user.id.toString() === userId
}

const getAttachmentsEmbed = (attachments) => {
    let attachEmbedComp = []

    let counter = 1
    if (attachments.size > 0) {
        attachments.forEach(attach => {
            attachEmbedComp.push({name: `Attachment ${counter++}:`, value: attach.url})
        });
    } else {
        attachEmbedComp.push({name: "Attachments", value: "No Attachments"})
    }

    return attachEmbedComp
}

async function messageUser(userId, message){//Todo get this to message and send warnings on invalid userids/failed messages
    logger.warn(`messageUser Not Implemented`)
    logger.info(`Sending user[${userId}] message: ${message}`)
}

client.login(TOKEN);