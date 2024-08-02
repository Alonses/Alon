const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    lang: { type: String, default: null },
    hoster: { type: Boolean, default: false },
    nick: { type: String, default: null },
    erase: {
        erase_on: { type: Number, default: null },
        valid: { type: Boolean, default: false },
        forced: { type: Boolean, defaul: false },
        timeout: { type: Number, default: 2 },
        guild_timeout: { type: Number, default: 2 }
    },
    social: {
        steam: { type: String, default: null },
        lastfm: { type: String, default: null },
        pula_predios: { type: String, default: null }
    },
    profile: {
        avatar: { type: String, default: null },
        about: { type: String, default: null },
        join: { type: Boolean, default: true },
        creation: { type: Boolean, default: true },
        bank: { type: Boolean, default: true },
        lastfm: { type: Boolean, default: false },
        steam: { type: Boolean, default: false },
        thumbnail: { type: String, default: null },
        cache: {
            about: { type: String, default: null }
        }
    },
    misc: {
        color: { type: String, default: "#29BB8E" },
        daily: { type: String, default: null },
        money: { type: Number, default: 0 },
        embed: { type: String, default: "#29BB8E" },
        locale: { type: String, default: null },
        weather: { type: Boolean, default: true },
        fixed_badge: { type: Number, default: null },
        second_lang: { type: String, default: null }
    },
    conf: {
        banned: { type: Boolean, default: false },
        ghost_mode: { type: Boolean, default: false },
        notify: { type: Boolean, default: false },
        ranking: { type: Boolean, default: true },
        global_tasks: { type: Boolean, default: true },
        public_badges: { type: Boolean, default: true },
        resumed: { type: Boolean, default: false },
        cached_guilds: { type: Boolean, default: false }
    }
})

const model = mongoose.model("User", schema)

async function checkUser(client, uid) {
    return !!await getUser(client, uid)
}

async function getUser(client, uid, includes = { }) {
   return await client.prisma.user.upsert({
       where: { id: uid },
       update: { },
       create: {
           id: uid,
           erase: { create: { } },
           social: { create: { } },
           profile: { create: { } },
           misc: { create: { } },
           conf: { create: { } }
        },
       include: includes
    })
}

async function getRankMoney(client) {
    return await client.prisma.user.findMany({
        take: 25,
        where: { misc: {  money: { gt: 0 } } },
        orderBy: { misc: { money: "desc" } }
    })
}

// Buscando os usuários que estão inativos para realizar a exclusão dos dados
async function getOutdatedUsers(client, timestamp) {
    return await client.prisma.user.findMany({
        where: { erase: { erase_on: { lte: timestamp } } }
    })
}

// Define um tempo de expiração para todos os usuários sem tempo definido
async function getUnknownUsers(client) {

    const users = await client.prisma.user.findMany({ where: { erase: { erase_on: null } } })

    for (let i = 0; i < users.length; i++) {
        const user = users[i]
        await client.prisma.userOptionsErase.update({
            where: { id: user.erase_id },
            data: { erase_on: client.timestamp() + 2419200 }
        })
    }
}

// Exclui o usuário por completo
async function dropUser(client, uid) {
    await client.prisma.user.deleteOne({ where: { id: uid } })
}

async function updateUser(client, uid, update) {
    await client.prisma.user.update({
        where: { id: uid },
        data: update
    })
}

// Lista todos os usuários com badges fixadas
async function getUserWithFixedBadges(client) {
    return await client.prisma.user.findMany({ where: { misc: { fixed_badge: { not: null } } } })
}

module.exports.User = model
module.exports = {
    getUser,
    checkUser,
    dropUser,
    updateUser,
    getRankMoney,
    getUnknownUsers,
    getOutdatedUsers,
    getUserWithFixedBadges
}