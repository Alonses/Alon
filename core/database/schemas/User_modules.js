const mongoose = require("mongoose")
const {client_data} = require("../../../setup");

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    type: { type: Number, default: null },
    data: { type: Number, default: null },
    stats: {
        price: { type: Number, default: 20 },
        days: { type: Number, default: null },
        hour: { type: String, default: null },
        active: { type: Boolean, default: false },
        timestamp: { type: Number, default: null }
    }
})

const model = mongoose.model("Module", schema)

async function getActiveModules(client, uid) {
    const filter = { active: true }
    if (uid !== undefined) filter.user_id = uid

    return client.prisma.userModules.findMany({where: filter});
}

async function createModule(client, uid, type, timestamp) {
    return client.prisma.userModules.create({
        data: {
            user_id: uid,
            type: type,
            timestamp: timestamp
        }
    })
}

async function getModule(client, uid, timestamp) {
    return client.prisma.userModules.findFirst({
        where: {
            user_id: uid,
            timestamp: timestamp
        }
    })
}

async function dropModule(client, uid, type, timestamp) {
    await client.prisma.userModules.deleteMany({
        where: {
            user_id: uid,
            timestamp: timestamp,
            type: type
        }
    })
}

async function dropAllUserModules(client, uid) {
    await client.prisma.userModules.deleteMany({ where: { user_id: uid } })
}

async function verifyUserModules(client, uid, type) {
    return client.prisma.userModules.findMany({
        where: {
            user_id: uid,
            type: type
        }
    })
}

// Lista todos os módulos de determinado usuário
async function listAllUserModules(client, uid) {
    return client.prisma.user.findUnique({ where: { id: uid } }).modules
}

async function shutdownAllUserModules(client, uid, type) {
    const filter = { user_id: uid }
    if (type !== undefined) filter.type = type

    await client.prisma.userModules.updateMany({
        where: filter,
        data: { active: false }
    })
}

// Retorna um preço pelos módulos ativos de determinado usuário
async function getModulesPrice(client, uid) {
    const modules = await getActiveModules(client, uid)
    return modules.reduce((total, element) => total + element.price, 0)
}

async function updateModule(client, id, update) {
    await client.prisma.userModules.update({
        where: { id: id },
        data: update
    })
}

module.exports.Badge = model
module.exports = {
    createModule,
    getModule,
    dropModule,
    getModulesPrice,
    getActiveModules,
    listAllUserModules,
    dropAllUserModules,
    verifyUserModules,
    shutdownAllUserModules,
    updateModule
}