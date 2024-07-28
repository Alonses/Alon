const mongoose = require("mongoose")

// sid -> Server ID

const schema = new mongoose.Schema({
    sid: { type: String, default: null },
    rank: { type: Number, default: 0 },
    action: { type: String, default: null },
    role: { type: String, default: null },
    timeout: { type: Number, default: 2 },
    timed_role: {
        status: { type: Boolean, default: false },
        timeout: { type: Number, default: 12 }
    }
})

const model = mongoose.model("Strike_guild", schema)

// Procurando por um strike
async function getGuildStrike(client, id, rank) {
    const key = {
        guild_id: id,
        rank: rank
    }

    const strike = await client.prisma.guildRoleAssigner.findFirst({ where: key });

    if (!strike) {
        await client.prisma.guildRoleAssigner.create({ data: key });
        return client.prisma.guildRoleAssigner.findFirst({ where: key });
    }

    return strike;
}

// Listando todos os strikes do servidor
async function listAllGuildStrikes(client, id) {
    return client.prisma.guildStrike.findMany({where: {guild_id: id}});
}

// Apaga o strike customizado
async function dropGuildStrike(client, id, rank) {
    await client.prisma.guildStrike.delete({
        where: {
            guild_id: id,
            rank: rank
        }
    })
}

// Apaga todos os strikes criados no servidor
async function dropAllGuildStrikes(client, id) {
    await client.prisma.guildStrike.deleteMany({ where: { guild_id: id } })
}

async function updateGuildStrike(client, id, data) {
    await client.prisma.guildStrike.update({
        where: {
            id: id
        },
        data: data
    })
}

module.exports.Strike_guild = model
module.exports = {
    getGuildStrike,
    listAllGuildStrikes,
    dropGuildStrike,
    dropAllGuildStrikes,
    updateGuildStrike
}