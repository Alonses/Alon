const mongoose = require("mongoose")

// uid -> User ID
// sid -> Server ID
// ixp -> XP utilizado pelo Bot ( imutável pelo usuário )
// o IXP é um campo que o bot faz uso para contabilizar o ranking global

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    sid: { type: String, default: null },
    nickname: { type: String, default: null },
    lastInteraction: { type: Number, default: null },
    warns: { type: Number, default: 0 },
    caldeira_de_ceira: { type: Boolean, default: false },
    xp: { type: Number, default: 0 },
    ixp: { type: Number, default: 0 },
    erase: {
        valid: { type: Boolean, default: false },
        erase_on: { type: Number, default: null }
    }
})

const model = mongoose.model("Rankerver", schema)

async function getRankServer(client, sid) {
    return client.prisma.userRankGuild.findMany({
        where: { server_id: sid },
        orderBy: { xp: "desc" },
        take: 50
    })
}

async function listRankGuild(client, sid) {
    return client.prisma.userRankGuild.findMany({ where: { server_id: sid } })
}

async function getAllUsers(client) {
    return client.prisma.userRankGuild.findMany()
}

async function getUserRankServers(client, uid) {
    return client.prisma.userRankGuild.findMany({ where: { user_id: uid } })
}

async function getUserRankServer(client, uid, sid) {
    const filter = {
        user_id: uid,
        server_id: sid
    }

    return client.prisma.userRankGuild.upsert({
        where: filter,
        update: { },
        create: filter
    })
}

// Buscando os usuários que estão desatualizados no escopo de servidor para exclusão dos dados
async function getGuildOutdatedUsers(client, timestamp) {
    return client.prisma.userRankGuild.findMany({
        where: { erase_on: { lte: timestamp } }
    })
}

async function createRankServer(client, uid, sid, experience) {
    await client.prisma.userRankGuild.create({
        data: {
            user_id: uid,
            server_id: sid,
            xp: experience
        }
    })
}

async function dropUserRankServer(client, uid, sid) {
    await client.prisma.userRankGuild.delete({
        where: {
            user_id: uid,
            server_id: sid
        }
    })
}

async function dropAllRankGuild(client, sid) {
    await client.prisma.userRankGuild.deleteMany({ where: { server_id: sid } })
}

async function dropAllUserGuildRanks(client, uid) {
    await client.prisma.userRankGuild.deleteMany({ where: { user_id: uid } })
}

async function dropUnknownRankServers(client, uid) {

    const guilds_ranking = await getUserRankServers(client, uid)

    // Procurando servidores que o usuário possui rank porém o bot não está incluso
    for (const valor of guilds_ranking) {
        let server = await client.guilds().get(valor.server_id)

        if (!server) await dropUserRankServer(client, uid, valor.server_id)
    }
}

async function updateUserRank(client) {
    const users = await getAllUsers(client)

    for (let i = 0; i < users.length; i++) {
        await updateUserRankGuild(client, users[i], { ixp: users[i].xp })
    }
}

// Define um tempo de expiração para todos os usuários sem tempo definido no escopo de servidor
async function getUnknowLastInteraction(client) {
    const users = await client.prisma.userRankGuild.findMany({ where: { erase_on: null } })

    for (let i = 0; i < users.length; i++) {

        const usuario = users[i]
        await updateUserRankGuild(client, usuario, { erase_on: client.timestamp() + 2419200 })
    }
}

async function updateUserRankGuild(client, userRank, update) {
    await client.prisma.userRankGuild.update({
        where: {
            user_id: userRank.user_id,
            server_id: userRank.server_id
        },
        data: update
    })
}

module.exports.Rankerver = model
module.exports = {
    getAllUsers,
    getRankServer,
    listRankGuild,
    getUserRankServer,
    getUserRankServers,
    getGuildOutdatedUsers,
    createRankServer,
    updateUserRank,
    updateUserRankGuild,
    dropUserRankServer,
    dropAllRankGuild,
    dropAllUserGuildRanks,
    dropUnknownRankServers,
    getUnknowLastInteraction
}