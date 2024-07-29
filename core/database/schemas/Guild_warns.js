const mongoose = require("mongoose")

// sid -> Server ID

const schema = new mongoose.Schema({
    sid: { type: String, default: null },
    rank: { type: Number, default: 0 },
    action: { type: String, default: null },
    role: { type: String, default: null },
    timeout: { type: Number, default: 2 },
    strikes: { type: Number, default: 0 },
    timed_role: {
        status: { type: Boolean, default: false },
        timeout: { type: Number, default: 12 }
    }
})

const model = mongoose.model("Warn_guild", schema)

// Procurando por uma advertência
async function getGuildWarn(client, id, rank) {

    const key = {
        guild_id: id,
        rank: rank
    }

    const warn = await client.prisma.guildWarn.findFirst({ where: key });

    if (!warn) {
        await client.prisma.guildWarn.create({ data: key });
        return client.prisma.guildWarn.findFirst({ where: key });
    }

    return warn;
}

// Listando todas as advertências do servidor
async function listAllGuildWarns(client, id) {
    return client.prisma.guildWarn.findMany({where: {guild_id: id}});
}

// Apaga a advertência customizada
async function dropGuildWarn(client, id, rank) {
    await client.prisma.guildWarn.delete({
        where: {
            guild_id: id,
            rank: rank
        }
    })
}

// Apaga todas as advertências criadas no servidor
async function dropAllGuildWarns(client, id) {
    await client.prisma.guildWarn.deleteMany({ where: { guild_id: id } })
}

async function updateGuildWarn(client, id, data) {
    await client.prisma.guildWarn.update({
        where: {
            id: id
        },
        data: data
    })
}

module.exports.Warns_guild = model
module.exports = {
    getGuildWarn,
    listAllGuildWarns,
    dropGuildWarn,
    dropAllGuildWarns,
    updateGuildWarn
}