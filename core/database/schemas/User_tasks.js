const mongoose = require("mongoose")

// uid -> User ID
// sid -> Server ID

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    sid: { type: String, default: null },
    text: { type: String, default: null },
    timestamp: { type: Number, default: null },
    g_timestamp: { type: Number, defaul: null },
    concluded: { type: Boolean, default: false }
})

const model = mongoose.model("Task", schema)

async function createTask(client, uid, sid, text, timestamp) {
    const filter = {
        user_id: uid,
        server_id: sid,
        text: text,
        timestamp: timestamp
    }

    const task = await client.prisma.userTasks.findFirst({ where: filter })
    if (!task) return client.prisma.userTasks.create({data: filter});

    return task
}

async function getTask(client, uid, timestamp) {
    return client.prisma.userTasks.findFirst({
        where: {
            user_id: uid,
            timestamp: timestamp
        }
    })
}

async function listAllUserTasks(client, uid, sid) {
    if (sid) return client.prisma.userTasks.findMany({
        where: {
            user_id: uid,
            server_id: sid
        },
        orderBy: { timestamp: "desc" }
    })

    return client.prisma.userTasks.findMany({
        where: { user_id: uid },
        orderBy: { timestamp: "desc" }
    })
}

async function listAllUserGroupTasks(client, uid, g_timestamp) {
    return client.prisma.userTasks.findMany({
        where: {
            user_id: uid,
            g_timestamp: g_timestamp
        }
    })
}

// Apaga uma task do usuário
async function dropTask(client, uid, timestamp) {
    await client.prisma.userTasks.deleteMany({
        where: {
            user_id: uid,
            timestamp: timestamp
        }
    })
}

async function dropTaskByGroup(client, uid, g_timestamp) {
    await client.prisma.userTasks.deleteMany({
        where: {
            user_id: uid,
            g_timestamp: g_timestamp
        }
    })
}

async function dropAllUserTasks(client, uid) {
    await client.prisma.userTasks.deleteMany({ where: { user_id: uid } })
}

async function dropAllGuildUserTasks(client, uid, sid) {
    await client.prisma.userTasks.deleteMany({
        where: {
            user_id: uid,
            server_id: sid
        }
    })
}

async function updateUserTask(client, id, update) {
    await client.prisma.userTasks.update({
        where: { id: id },
        data: update
    })
}

module.exports.Task = model
module.exports = {
    createTask,
    getTask,
    dropTask,
    dropTaskByGroup,
    dropAllUserTasks,
    listAllUserTasks,
    listAllUserGroupTasks,
    dropAllGuildUserTasks,
    updateUserTask
}