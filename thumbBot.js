const Discord = require("discord.js");
const {logger} = require('./logging')

const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'DIRECT_MESSAGES']
const client = new Discord.Client({intents: intents});

const config = require("./config.json");
const TOKEN = require("./token.json").TOKEN;
const {API} = require("./util")

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
            logger.log('trace',"Message Creation Switch Verify")
            if (memberHasRole(config.adminRole, member)) await processVerifyMessage(message)
            break
        case config.channelSubmit:
            logger.log('trace',"Message Creation Switch Submit")
            if (memberHasRole(config.playerRole, member)) await processSubmission(message)
            break
        default:
            break
    }
})

/**
 * Process Buttons
 */
client.on('interactionCreate', interaction => {
    if (!interaction.isButton()) return;
    const submissionId = interaction.message.reference.messageId
    API.verifySubmission(submissionId)
    const content = `\`{value}\` has been verified for submission \`${submissionId}\``
    interaction.reply(content)
})

const processSubmission = async (message) => {
    logger.debug(`Processing Submission - msgid:${message.id} content:\"${message.content}\"`)
    await forwardMsgToVerify(message);
    API.submitNew(message.id, message.content, message.author.id)
    message.delete().then(msg => logger.debug(`Deleted Submission Message - msgid:${msg.id}`));
}

const forwardMsgToVerify = async (message) => {
    logger.debug(`Forwarding Submission to Verify - msgid:${message.id}`)

    const channel = await client.channels.fetch(config.channelVerify);
    let msg = `<@${message.author.id}> **Sent:**\`\`\`${message.content}\`\`\`**With Attachments:**\n`;//TODO convert to embed
    msg += getAttachmentsString(message.attachments)

    logger.log("trace", `Sending ${message.id} to Verify Channel`);
    const newMsg = await channel.send(msg);
    logger.debug(`Submission sent to Verify - msgid:${message.id} -> ${newMsg.id}`)
}

const processVerifyMessage = async (message) => {
    const submitId = message.reference.messageId
    const submission = API.getSubmission(submitId)
    const submitValue = parseInt(message.content)

    if(!submission){
        logger.log('debug',`Message[${submitId}] id not a submission (not found in DB)`)
        await message.reply(`The message you replied to is not a submission.`)
    } else if (isNaN(submitValue)) {
        logger.log('debug',`VerifyProcessing Invalid Submission Value - \"${message.content}\"`)
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
    comp.addComponents(new Discord.MessageButton({label: "Verify", customId: "verifyButton", style: "PRIMARY"}))

    await submission.reply({
        content: `Verify the value \`${message.content}\` for this submission?`,
        components: [comp]
    })
}

const memberHasRole = (roleId, member) => {
    logger.log('trace',`memberHasRole call - member: ${member.id} role: ${roleId}`)
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

const getAttachmentsString = (attachments) => {
    let attachStr = ""

    if (attachments.size > 0) {
        attachments.forEach(attach => {
            attachStr += `${attach.url}\n`
        });
    } else {
        attachStr += "*None*"
    }

    return attachStr
}

client.login(TOKEN);