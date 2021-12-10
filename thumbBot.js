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
    if (message.author.id == client.user.id){//dont process messages from the bot
        return
    }
    if (config.channelsSubmit.includes(message.channelId)) {//process messages sent in submit channels
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

    logger.log('trace',`Fetching Channel - id:${config.channelVerify}`)
    const channel = await client.channels.fetch(config.channelVerify);
    let msg = `<@${message.author.id}> **Sent:**\`\`\`${message.content}\`\`\`**With Attachments:**\n`;//TODO convert to embed

    if (message.attachments.size > 0) {
        message.attachments.forEach(attach => {
            msg += `${attach.url}\n`
        });
    } else {
        msg += "*None*"
    }

    logger.log("trace",`Sending ${message.id} to Verify Channel`);
    newMsg = await channel.send(msg);
    logger.debug(`Submission sent to Verify - msgid:${message.id} -> ${newMsg.id}`)
}

client.login(TOKEN);