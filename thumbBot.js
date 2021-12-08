const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config.json");
const TOKEN = require("./token.json").TOKEN
const PREFIX = config.prefix;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
})

client.login(TOKEN);