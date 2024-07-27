const mongoose = require("mongoose")

const { defaultEraser } = require("../../formatters/patterns/timeout")

const schema = new mongoose.Schema({
    sid: { type: String, default: null },
    lang: { type: String, default: "pt-br" },
    inviter: { type: String, default: null },
    erase: {
        valid: { type: Boolean, default: false },
        timeout: { type: Number, default: 5 },
        timestamp: { type: String, default: null }
    },
    games: {
        channel: { type: String, default: null },
        role: { type: String, default: null }
    },
    tickets: {
        category: { type: String, default: null }
    },
    warn: {
        notify: { type: Boolean, default: true },
        notify_exclusion: { type: Boolean, default: true },
        timed: { type: Boolean, default: false },
        channel: { type: String, default: null },
        timeout: { type: Number, default: 2 },
        reset: { type: Number, default: 7 },
        erase_ban_messages: { type: Number, default: 0 },
        timed_channel: { type: String, default: null },
        announce: {
            status: { type: Boolean, default: false },
            channel: { type: String, default: null }
        },
        hierarchy: {
            status: { type: Boolean, default: false },
            strikes: { type: Number, default: 3 },
            timed: { type: Boolean, default: false },
            reset: { type: Number, default: 4 },
            channel: { type: String, default: null }
        }
    },
    reports: {
        channel: { type: String, default: null },
        auto_ban: { type: Boolean, default: false },
        notify: { type: Boolean, default: false },
        role: { type: String, default: null },
        erase_ban_messages: { type: Number, default: 0 }
    },
    speaker: {
        regional_limit: { type: Boolean, default: false },
        channels: { type: String, default: null }
    },
    logger: {
        channel: { type: String, default: null },
        message_edit: { type: Boolean, default: true },
        message_delete: { type: Boolean, default: true },
        member_nick: { type: Boolean, default: false },
        member_image: { type: Boolean, default: true },
        member_role: { type: Boolean, default: true },
        member_join: { type: Boolean, default: true },
        member_left: { type: Boolean, default: true },
        channel_created: { type: Boolean, default: false },
        channel_delete: { type: Boolean, default: false },
        member_punishment: { type: Boolean, default: true },
        member_kick: { type: Boolean, default: true },
        member_ban_add: { type: Boolean, default: true },
        member_ban_remove: { type: Boolean, default: true },
        member_voice_status: { type: Boolean, default: false },
        invite_created: { type: Boolean, default: false },
        invite_deleted: { type: Boolean, default: false }
    },
    death_note: {
        note: { type: Boolean, default: false },
        notify: { type: Boolean, default: true },
        channel: { type: String, default: null },
        member_punishment: { type: Boolean, default: true },
        member_kick: { type: Boolean, default: true },
        member_ban_add: { type: Boolean, default: true },
        member_ban_remove: { type: Boolean, default: true }
    },
    spam: {
        notify: { type: Boolean, default: true },
        strikes: { type: Boolean, default: true },
        timeout: { type: Number, default: 2 },
        manage_mods: { type: Boolean, default: false },
        trigger_amount: { type: Number, default: 5 },
        suspicious_links: { type: Boolean, default: false },
        channel: { type: String, default: null },
        scanner: {
            links: { type: Boolean, default: false }
        }
    },
    network: {
        link: { type: String, default: null },
        channel: { type: String, default: null },
        member_punishment: { type: Boolean, default: true },
        member_ban_add: { type: Boolean, default: true },
        member_kick: { type: Boolean, default: true },
        erase_ban_messages: { type: Number, default: 0 },
        scanner: {
            type: { type: Boolean, default: true }
        }
    },
    timed_roles: {
        timeout: { type: Number, default: 5 },
        channel: { type: String, default: null }
    },
    misc: {
        second_lang: { type: String, default: null }
    },
    conf: {
        games: { type: Boolean, default: false },
        tickets: { type: Boolean, default: false },
        reports: { type: Boolean, default: false },
        logger: { type: Boolean, default: false },
        spam: { type: Boolean, default: false },
        network: { type: Boolean, default: false },
        warn: { type: Boolean, default: false },
        nuke_invites: { type: Boolean, default: false }
    }
})

const model = mongoose.model("Guild", schema)

async function getGuild(client, gid) {
    return await client.prisma.guild.upsert({
        where: { id: gid },
        update: {},
        create: { id: gid }
    })
}

async function getSpecificGameChannel(client, gcid) {
    return await client.prisma.guild.findFirst({
        where: {
            games_channel: gcid,
            conf_games: true
        }
    })
}

async function getGameChannels(client) {
    return await client.prisma.guild.findMany({ where: { conf_games: true } })
}

async function getGameChannelById(client, gcid) {
    return await client.prisma.guild.findUnique({ where: { games_channel: gcid } })
}

async function getReportChannels(client) {
    return await client.prisma.guild.findMany({ where: { conf_reports: true } })
}

async function getReportNetworkChannels(client, link) {
    return await client.prisma.guild.findFirst({
        where: {
            network_link: link,
            conf_reports: true
        }
    })
}

async function disableGuildFeatures(client, gid) {
    const guild = await getGuild(client, gid)

    await client.prisma.guild.update({
        where: { id: gid },
        data: {
            inviter: null,
            network_link: null,
            erase_timestamp: client.timestamp() + defaultEraser[guild?.erase.timeout || 5],
            erase_valid: true
        }
    })
}

async function getNetworkedGuilds(client, link) {
    return await client.prisma.guild.findMany({ where: { network_link: link } })
}

async function getRankHosters(client) {

    // Lista todos os servidores com hosters salvos
    const guilds = await client.prisma.guild.findMany({
        where: {
            inviter: {
                not: null
            }
        }
    });

    const users_map = {}
    const rank = []

    guilds.forEach(guild => {
        // Contabilizando os convites de cada hoster
        if (users_map[guild.inviter])
            users_map[guild.inviter]++
        else
            users_map[guild.inviter] = 1
    })

    Object.keys(users_map).forEach(key => {
        rank.push({
            "uid": key,
            "invites": users_map[key]
        })
    })

    // Ordenando a lista de hosters que convidaram o bot
    rank.sort(function (a, b) {
        if (a.invites < b.invites) return 1
        if (a.invites > b.invites) return -1
        return 0
    })

    // Retornando apenas os dois primeiros
    return [await client.getUser(rank[0].uid), await client.getUser(rank[1].uid)]
}

async function getTimedGuilds(client) {
    return await client.prisma.guild.findMany({ where: { warn_timed: true } })
}

async function getTimedPreGuilds(client) {
    return await client.prisma.guild.findMany({ where: { warn_hierarchy_timed: true } })
}

// Lista todos os servidores salvos
async function listAllGuilds(client) {
    return await client.prisma.guild.findMany()
}

async function getEraseGuilds(client) {
    return await client.prisma.guild.findMany({ where: { erase_valid: true } })
}

// Exclui o servidor por completo
async function dropGuild(client, gid) {
    await client.prisma.guild.delete({ where: { id: gid } })
}

async function listAllGuildHoster(client, user_id) {
    return await client.prisma.guild.findMany({ where: { inviter: user_id } })
}

async function updateGuild(client, gid, data) {
    await client.prisma.guild.update({
        where: { id: gid },
        data: data
    })
}

module.exports.Guild = model
module.exports = {
    getGuild,
    listAllGuilds,
    getGameChannels,
    getSpecificGameChannel,
    disableGuildFeatures,
    getReportChannels,
    listAllGuildHoster,
    getReportNetworkChannels,
    getGameChannelById,
    getNetworkedGuilds,
    getRankHosters,
    getTimedGuilds,
    getTimedPreGuilds,
    getEraseGuilds,
    updateGuild,
    dropGuild
}