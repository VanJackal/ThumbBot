const Transport = require("winston-transport")
const Discord = require("discord.js")

const COLOR_FATAL = "#ff0000"
const COLOR_ERROR = "#ff9100"
const COLOR_WARN = "#ffd500"
const COLOR_INFO = "#47bdff"
const COLOR_DEBUG = "#397237"
const COLOR_TRACE = "#595959"
const COLOR_DEFAULT = "#595959"

const TECHS = [
    "153227917084721153",
    "749970165600616539"
]

/**
 * @param client {Discord.Client}
 * @param channelIds {string[]}
 * @param opts
 * @returns {Promise<DiscordTransport>}
 */
async function buildDiscordTransport(client, channelIds, opts = {}) {
    const channels = await getChannelsFromList(client, channelIds)
    return new DiscordTransport(client, channels, opts)
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

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info)
        })

        const embed = getEmbed(info.level, info.message, info.timestamp)
        const additional = getAdditionalMsg(info.level)
        this.sendToLogging(embed, additional)

        callback()
    }

    sendToLogging(embed, additional) {
        this.channels.forEach(channel => {
            channel.send({embeds: [embed], content: additional || null}).catch(e => {
                console.log("Error in DiscordTransport when sending to a logging channel")
                console.log(e)
            })
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

function getAdditionalMsg(level) {
    switch (level) {
        case "fatal":
            return "@everyone"
        case "error":
            return "@everyone"
        case "warn":
            let msg = ""
            TECHS.forEach(tech => msg += `<@${tech}> `)
            return msg
        default:
            return ""
    }
}

function getColor(level) {
    switch (level) {
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
async function getChannelsFromList(client, channelList) {
    let channels = []
    channelList.forEach(channelId => {
        client.channels.fetch(channelId).then(channel => channels.push(channel))
    })
    return channels
}

module.exports = {
    DiscordTransport: DiscordTransport,
    getChannelsFromList: getChannelsFromList,
    buildDiscordTransport: buildDiscordTransport
}