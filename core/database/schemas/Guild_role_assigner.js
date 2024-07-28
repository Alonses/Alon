const mongoose = require("mongoose")

// sid -> Server ID

const schema = new mongoose.Schema({
    sid: { type: String, default: null },
    interaction: { type: String, default: null },
    atribute: { type: String, default: null },
    ignore: { type: String, default: null },
    type: { type: String, default: "global" },
    status: { type: Boolean, default: false }
})

const model = mongoose.model("Role_Assigner", schema)

async function getRoleAssigner(client, id, type) {
    return client.prisma.guildRoleAssigner.upsert({
        where: {
            guild_id: id,
            type: type
        },
        update: { },
        create: {
            guild_id: id,
            type: type
        }
    })
}

async function getActiveRoleAssigner(client, type) {
    return client.prisma.guildRoleAssigner.findMany({
        where: {
            type: type,
            status: true,
        }
    })
}

async function dropRoleAssigner(client, id) {
    await client.prisma.deleteOne({
        where: {
            guild_id: id
        }
    })
}

async function updateRoleAssigner(client, id, data, isGuildId = false) {
    await client.prisma.guildRoleAssigner.update({
        where: isGuildId ? { guild_id: id } : { id: id },
        data: data
    })
}

module.exports.Role_Assigner = model
module.exports = {
    getRoleAssigner,
    getActiveRoleAssigner,
    dropRoleAssigner,
    updateRoleAssigner
}