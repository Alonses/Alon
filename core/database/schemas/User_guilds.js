const mongoose = require("mongoose")

// uid -> User ID
// sid -> Server ID

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    sid: { type: String, default: null }
})

const model = mongoose.model("User_guild", schema)

async function registerUserGuild(client, uid, sid) {
    const user = await client.prisma.user.findUnique({ where: { id: uid } })

    if (user && !user.guilds.includes(sid))
        await client.prisma.user.update({
            where: { id: uid },
            data: { guilds: { push: sid } }
        })
}

async function listAllUserGuilds(client, uid) {
    const user = await client.prisma.user.findUnique({ where: { id: uid } })

    return user.guilds
}

// Remove o registro de um servidor do usuário
async function dropUserGuild(client, uid, sid) {
    const user = await client.prisma.user.findUnique({ where: { id: uid } })

    if (user && !user.guilds.includes(sid))
        await client.prisma.user.update({
            where: { id: uid },
            data: { guilds: { unset: sid } }
        })
}

// Remove todos os registros com o servidor informado
async function dropAllUserGuilds(client, sid) {
    await client.prisma.user.updateMany({
        where: { guilds: { hasEvery: [sid] } },
        data: { guilds: { unset: sid } }
    })
}

module.exports.User_guild = model
module.exports = {
    registerUserGuild,
    listAllUserGuilds,
    dropUserGuild,
    dropAllUserGuilds
}