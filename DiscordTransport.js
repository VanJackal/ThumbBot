const Transport = require("winston-transport")
const Discord = require("discord.js")

const COLOR_FATAL = "#ff0000"
const COLOR_ERROR = "#ff9100"
const COLOR_WARN = "#ffd500"
const COLOR_INFO = "#47bdff"
const COLOR_DEBUG = "#397237"
const COLOR_TRACE = "#595959"
const COLOR_DEFAULT = "#595959"

/**
 * @param client {Discord.Client}
 * @param channelIds {string[]}
 * @param opts
 * @returns {Promise<DiscordTransport>}
 */
async function buildDiscordTransport(client, channelIds, opts = {}){
    const channels = await getChannelsFromList(client, channelIds)
    return new DiscordTransport(client,channels,opts)
}

class DiscordTransport extends Transport {
    /**
     * @param {Discord.Client} client
     * @param {Discord.TextChannel[]} channels
     * @param opts
     */
    constructor(client, channels, opts) {
        super(opts)
        this.client = client
        this.channels = channels
    }

    log(info,callback){
        setImmediate(() => {
            this.emit('logged',info)
        })

        const embed = getEmbed(info.level, info.message, info.timestamp)
        this.sendToLogging(embed)

        callback()
    }

    sendToLogging(embed) {
        this.channels.forEach(channel => {
            console.log(channel)
            channel.send({embeds:[embed]})
        })
    }
}


/**
 *
 * @param level {string}
 * @param message {string}
 * @param timestamp {string}
 * @returns {Discord.MessageEmbed}
 */
function getEmbed(level, message, timestamp) {
    const color = getColor(level)
    return new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(level)
        .addField("Message", message)
        .setFooter(`Sent at: ${timestamp}`)
}

function getColor(level){
    switch(level){
        case "fatal":
            return COLOR_FATAL
        case "error":
            return COLOR_ERROR
        case "warn":
            return COLOR_WARN
        case "info":
            return COLOR_INFO
        case "debug":
            return COLOR_DEBUG
        case "trace":
            return COLOR_TRACE
        default:
            return COLOR_DEFAULT
    }
}

/**
 * @param {Discord.Client} client
 * @param {*[]} channelList
 * @returns {Promise<Discord.TextChannel[]>}
 */
async function getChannelsFromList(client, channelList){
    let channels = []
    channelList.forEach(channelId => {
        client.channels.fetch(channelId).then(channel => channels.push(channel))
    })
    return channels
}

module.exports = {
    DiscordTransport:DiscordTransport,
    getChannelsFromList:getChannelsFromList,
    buildDiscordTransport:buildDiscordTransport
}