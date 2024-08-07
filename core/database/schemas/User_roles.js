const mongoose = require("mongoose")

// uid - User ID
// sid - Server ID
// rid - Role ID

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    sid: { type: String, default: null },
    rid: { type: String, default: null },
    nick: { type: String, default: null },
    valid: { type: Boolean, default: false },
    timeout: { type: Number, default: 5 },
    assigner: { type: String, default: null },
    assigner_nick: { type: String, default: null },
    relatory: { type: String, default: null },
    timestamp: { type: Number, default: null },
})

const model = mongoose.model("User_role", schema)

async function getUserRole(client, uid, sid, timestamp) {
    const filter = {
        user_id: uid,
        server_id: sid,
        timestamp: timestamp
    }

    const role = await client.prisma.userRoles.findFirst({ where: filter })
    if (!role) return client.prisma.userRoles.create({ data: filter })

    return role
}

async function getTimedRoleAssigner(client, uid, sid) {
    return client.prisma.userRoles.findFirst({
        where: {
            user_id: uid,
            server_id: sid,
            valid: false
        },
        orderBy: { timestamp: "desc" }
    })
}

async function checkUserGuildRoles(client, sid) {
    return client.prisma.userRoles.findMany({
        where: {
            server_id: sid,
            valid: true
        },
        take: 50
    })
}

async function listAllUserValidyRoles(client) {
    return client.prisma.userRoles.findMany({ where: { valid: true } })
}

async function filterRemovedTimedRole(client, uid, sid, rid) {
    return client.prisma.userRoles.findMany({
        where: {
            user_id: uid,
            server_id: sid,
            role_id: rid,
            valid: true
        }
    })
}

async function listAllUserGuildRoles(client, uid, sid) {
    return client.prisma.userRoles.findMany({
        where: {
            user_id: uid,
            server_id: sid,
            valid: true
        }
    })
}

async function listAllCachedUserGuildRoles(client, uid, sid) {
    return client.prisma.userRoles.findMany({
        where: {
            user_id: uid,
            server_id: sid,
            valid: false
        }
    })
}

async function removeCachedUserRole(client, uid, sid) {
    return client.prisma.userRoles.deleteMany({
        where: {
            user_id: uid,
            server_id: sid,
            valid: false
        }
    })
}

async function dropAllUserGuildRoles(client, uid, sid) {
    return client.prisma.userRoles.deleteMany({
        where: {
            user_id: uid,
            server_id: sid
        }
    })
}

async function dropUserTimedRole(client, uid, sid, rid) {
    return client.prisma.userRoles.deleteMany({
        where: {
            user_id: uid,
            server_id: sid,
            role_id: rid
        }
    })
}

async function dropAllGuildRoles(client, sid) {
    return client.prisma.userRoles.deleteMany({ where: { server_id: sid } })
}

async function updateUserRole(client, id, update) {
    await client.prisma.userRoles.update({
        where: { id: id },
        data: update
    })
}

module.exports.User_role = model
module.exports = {
    getUserRole,
    getTimedRoleAssigner,
    checkUserGuildRoles,
    listAllUserGuildRoles,
    removeCachedUserRole,
    listAllCachedUserGuildRoles,
    dropAllUserGuildRoles,
    dropAllGuildRoles,
    dropUserTimedRole,
    listAllUserValidyRoles,
    filterRemovedTimedRole,
    updateUserRole
}