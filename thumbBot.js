const Discord = require("discord.js");
const { logger } = require('./logging')

const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'DIRECT_MESSAGES']
const client = new Discord.Client({ intents: intents });

const config = require("./config.json");
const TOKEN = require("./token.json").TOKEN
const PREFIX = config.prefix;

logger.info("Startup")

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (config["channels-submit"].includes(message.channelId)) {
        processSubmission(message)
    }
});

const processSubmission = async (message) => {
    logger.debug(`Processing Submission - msgid:${message.id} content:\"${message.content}\"`)
    await forwardMsgToVerify(message);
    message.delete().then(msg => logger.debug(`Deleted Submission Message - msgid:${msg.id}`));
}

const forwardMsgToVerify = async (message) => {
    logger.debug(`Forwarding Submission to Verify - msgid:${message.id}`)

    const channel = await client.channels.fetch(config["channel-verify"]);
    let msg = `<@${message.author.id}> **Sent:**\`\`\`${message.content}\`\`\`**With Attachments:**\n`;//TODO convert to embed

    if (message.attachments.size > 0) {
        message.attachments.forEach(attach => {
            msg += `${attach.url}\n`
        });
    } else {
        msg += "*None*"
    }

    newMsg = await channel.send(msg);
    logger.debug(`Submission sent to Verify - msgid:${message.id} -> ${newMsg.id}`)
}

client.login(TOKEN);