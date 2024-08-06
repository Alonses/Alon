const mongoose = require("mongoose")

// uid - User ID
// sid - Server ID

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    sid: { type: String, default: null },
    nick: { type: String, default: null },
    hierarchy: { type: Boolean, default: false },
    valid: { type: Boolean, default: false },
    timeout: { type: Boolean, default: true },
    assigner: { type: String, default: null },
    assigner_nick: { type: String, default: null },
    relatory: { type: String, default: null },
    timestamp: { type: Number, default: null },
})

const model = mongoose.model("Warn", schema)

async function getUserWarn(client, uid, sid, timestamp) {

    const filter = {
        user_id: uid,
        server_id: sid,
        timestamp: timestamp
    }

    const warn = await client.prisma.userWarns.findFirst({ where: filter })

    if (!warn) return client.prisma.userWarns.create(filter);

    return warn
}

async function checkUserGuildWarned(client, sid) {

    // Listando apenas os usuários que possuem advertências registradas no servidor
    return client.prisma.userWarns.findMany({
        where: {
            server_id: sid,
            valid: true
        },
        take: 50
    })
}

async function listAllUserWarns(client, uid, sid) {

    // Listando todas as advertências que um usuário recebeu em um servidor
    return client.prisma.userWarns.findMany({
        where: {
            user_id: uid,
            server_id: sid,
            valid: true
        }
    })
}

async function listAllUserCachedHierarchyWarns(client, uid, sid) {

    // Listando todas as advertências que um usuário recebeu em um servidor
    return client.prisma.userWarns.findMany({
        where: {
            user_id: uid,
            server_id: sid,
            hierarchy: true,
            valid: false
        }
    })
}

async function listAllCachedUserWarns(client, uid, sid) {

    // Listando as advertências em cache do usuário
    return client.prisma.userWarns.findMany({
        where: {
            user_id: uid,
            server_id: sid,
            valid: false
        }
    })
}

async function removeUserWarn(client, uid, sid, timestamp) {

    await client.prisma.userWarns.deleteMany({
        where: {
            user_id: uid,
            server_id: sid,
            timestamp: timestamp
        }
    })
}

async function dropAllUserGuildWarns(client, uid, sid) {

    // Remove todas as advertências que o usuário recebeu no servidor
    await client.prisma.userWarns.deleteMany({
        where: {
            user_id: uid,
            server_id: sid
        }
    })
}

async function dropAllGuildWarns(client, sid) {

    // Remove todas as advertências registradas no servidor
    await client.prisma.userWarns.deleteMany({ where: { server_id: sid } })
}

async function updateWarn(client, id, update) {
    await client.prisma.userWarns.update({
        where: { id: id },
        data: update
    })
}

module.exports.Warn = model
module.exports = {
    getUserWarn,
    checkUserGuildWarned,
    listAllUserWarns,
    listAllUserCachedHierarchyWarns,
    removeUserWarn,
    listAllCachedUserWarns,
    dropAllUserGuildWarns,
    dropAllGuildWarns,
    updateWarn
}