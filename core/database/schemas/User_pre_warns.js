const mongoose = require("mongoose")

// uid - User ID
// sid - Server ID

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    sid: { type: String, default: null },
    nick: { type: String, default: null },
    valid: { type: Boolean, default: false },
    timeout: { type: Boolean, default: true },
    assigner: { type: String, default: null },
    assigner_nick: { type: String, default: null },
    relatory: { type: String, default: null },
    timestamp: { type: Number, default: null },
})

const model = mongoose.model("User_pre_warn", schema)

async function getUserPreWarn(client, uid, sid, timestamp) {
    const filter = {
        user_id: uid,
        server_id: sid,
        timestamp: timestamp
    }

    const preWarn = await client.prisma.userPreWarns.findFirst({ where: filter })
    if (!preWarn) return client.prisma.userPreWarns.create({ data: filter });

    return preWarn
}

async function checkUserGuildPreWarned(client, sid) {

    // Listando apenas os usuários que possuem anotações de advertência registradas no servidor
    return client.prisma.userPreWarns.findMany({
        where: {
            server_id: sid,
            valid: true
        },
        take: 50
    })
}

async function listAllUserPreWarns(client, uid, sid) {

    // Listando todas as anotações de advertência que um usuário recebeu em um servidor
    return client.prisma.userPreWarns.findMany({
        where: {
            server_id: sid,
            user_id: uid,
            valid: true
        }
    })
}

async function listAllGuildPreWarns(client, sid) {

    // Lista todas as anotações de advertência válidas do servidor
    return client.prisma.userPreWarns.findMany({
        where: {
            server_id: sid,
            valid: true
        }
    })
}

async function listAllCachedUserPreWarns(client, uid, sid) {

    // Listando as anotações de advertência em cache do usuário
    return client.prisma.userPreWarns.findMany({
        where: {
            server_id: sid,
            user_id: uid,
            valid: false
        }
    })
}

async function removeUserPreWarn(client, uid, sid, timestamp) {
    await client.prisma.userPreWarns.deleteMany({
        where: {
            user_id: uid,
            server_id: sid,
            timestamp: timestamp
        }
    })
}

async function dropAllUserGuildPreWarns(client, uid, sid) {

    // Remove todas as anotações de advertência que o usuário recebeu no servidor
    await client.prisma.userPreWarns.deleteMany({
        where: {
            user_id: uid,
            server_id: sid
        }
    })
}

async function dropAllGuildPreWarns(client, sid) {

    // Remove todas as anotações de advertência registradas no servidor
    await client.prisma.userPreWarns.deleteMany({ where: { server_id: sid  } })
}

async function updatePreWarn(client, preWarn){
    await client.prisma.userPreWarns.update({
        where: { id: preWarn.id },
        data: preWarn
    })
}

module.exports.User_pre_warn = model
module.exports = {
    getUserPreWarn,
    checkUserGuildPreWarned,
    listAllGuildPreWarns,
    listAllUserPreWarns,
    removeUserPreWarn,
    listAllCachedUserPreWarns,
    dropAllUserGuildPreWarns,
    dropAllGuildPreWarns,
    updatePreWarn
}