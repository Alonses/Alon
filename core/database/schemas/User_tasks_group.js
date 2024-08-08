const mongoose = require("mongoose")

// uid -> User ID
// sid -> Server ID

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    sid: { type: String, defaul: null },
    name: { type: String, default: null },
    timestamp: { type: Number, default: null }
})

const model = mongoose.model("Task_group", schema)

async function createGroup(client, uid, name, sid, timestamp) {

    const group = await client.prisma.userTasksGroup.findUnique({
        where: {
            id: {
                user_id: uid,
                server_id: sid,
                name: name
            }
        }
    })

    if (!group) return client.prisma.userTasksGroup.create({
        data: {
            user_id: uid,
            server_id: sid,
            name: name,
            timestamp: timestamp
        }
    })

    return group
}

async function getUserGroup(client, uid, timestamp) {
    return client.prisma.userTasksGroup.findFirst({
        where: {
            user_id: uid,
            timestamp: timestamp
        }
    })
}

async function listAllUserGroups(client, uid, sid) {
    const filter = !sid ? { user_id: uid } : {
            user_id: uid,
            server_id: sid
        }

    return client.prisma.userTasksGroup.findFirst({
        where: filter
    })
}

async function checkUserGroup(client, uid, name, sid) {
    const filter = !sid ? {
        user_id: uid,
        name: name
    } : {
        user_id: uid,
        server_id: sid,
        name: name
    }

    return client.prisma.userTasksGroup.findFirst({
        where: filter
    })
}

// Apaga o grupo de tasks do usuário
async function dropGroup(client, uid, timestamp) {
    await client.prisma.userTasksGroup.deleteMany({
        where: {
            user_id: uid,
            timestamp: timestamp
        }
    })
}

async function dropAllUserGroups(client, uid) {
    await client.prisma.userTasksGroup.deleteMany({ where: { user_id: uid } })
}

async function dropAllGuildUserGroups(client, uid, sid) {
    await client.prisma.userTasksGroup.deleteMany({
        where: {
            user_id: uid,
            server_id: sid
        }
    })
}

async function updateUserTaskGroup(client, group, update) {
    await client.prisma.userTasksGroup.update({
        where: {
            id: {
                user_id: group.user_id,
                server_id: group.server_id,
                name: group.name
            }
        },
        data: update
    })
}

module.exports.Task_group = model
module.exports = {
    createGroup,
    getUserGroup,
    checkUserGroup,
    dropAllUserGroups,
    listAllUserGroups,
    dropGroup,
    dropAllGuildUserGroups,
    updateUserTaskGroup
}