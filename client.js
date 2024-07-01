const { Client, GatewayIntentBits, Partials } = require('discord.js')
const { PrismaClient} = require("@prisma/client")

const idioma = require('./core/data/language')
const translate = require('./core/formatters/translate')
const { client_data } = require('./setup')

/* --------------------------------------------------------------- */

const cli = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Message,
        Partials.GuildMember
    ],
    disableEveryone: false
})

const prisma = new PrismaClient()

class CeiraClient {
    constructor() {
        this.discord = cli
        this.prisma = prisma
        this.tls = translate
        this.idioma = idioma
        this.x = client_data
        this.cached = {
            last_interaction: 0,
            presence: null,
            ranking_value: 0,
            regex: /[A-Za-z0-9--]+\.[A-Za-z0-9]{2,10}(?:\/[^\s/]+)*\/?\s/gi,
            fixed_badges: {},
            warns: new Map(),
            join_guilds: new Map(),
            rank: {
                bank: []
            }
        }
    }

    avatar() {
        return this.discord.user.avatarURL({ dynamic: true })
    }

    channels(type) {

        if (type) return this.discord.channels.cache.filter((c) => c.type === type)

        return this.discord.channels.cache
    }

    guilds(id_guild) {

        let guilds_cache = this.discord.guilds.cache
        let guilds

        if (id_guild)
            guilds_cache.forEach(guild => {
                if (guild.id === id_guild)
                    guilds = guild
            })
        else
            guilds = guilds_cache

        return guilds
    }

    id() {
        return this.discord.user.id
    }

    login(token) {
        return this.discord.login(token)
    }

    user() {
        return this.discord.user
    }

    username() {
        return this.discord.user.username
    }
}

module.exports.CeiraClient = CeiraClient