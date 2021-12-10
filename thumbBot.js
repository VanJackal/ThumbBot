const Discord = require("discord.js");
const intents = ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'DIRECT_MESSAGES']
const client = new Discord.Client({ intents: intents });

const config = require("./config.json");
const TOKEN = require("./token.json").TOKEN
const PREFIX = config.prefix;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (config["channels-submit"].includes(message.channelId)) {
        await forwardMsgToVerify(message);
        message.delete().then(msg => console.log(`Delete Message: ${msg.id}`));
    }
});

const forwardMsgToVerify = async (message) => {
    const channel = await client.channels.fetch(config["channel-verify"]);
    let msg = `<@${message.author.id}> **Sent:**\`\`\`${message.content}\`\`\`**With Attachments:**\n`;//TODO convert to embed
    console.log(message.attachments)
    if (message.attachments.size > 0) {
        message.attachments.forEach(attach => {
            msg += `${attach.url}\n`
        });
    } else {
        msg += "*None*"
    }
    channel.send(msg);
}

client.login(TOKEN);