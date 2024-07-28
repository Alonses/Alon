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
    const key = {
        guild_id: id,
        type: type
    }

    const roleAssigner = await client.prisma.guildRoleAssigner.findFirst({ where: key });

    if (!roleAssigner) {
        await client.prisma.guildRoleAssigner.create({ data: key });
        return client.prisma.guildRoleAssigner.findFirst({ where: key });
    }

    return roleAssigner;
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
    await client.prisma.guildRoleAssigner.delete({
        where: {
            guild_id: id
        }
    })
}

async function updateRoleAssigner(client, id, data) {
    await client.prisma.guildRoleAssigner.update({
        where: { id: id },
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