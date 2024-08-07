const mongoose = require("mongoose")

// uid - User ID
// sid - Server ID

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    sid: { type: String, default: null },
    strikes: { type: Number, default: 0 }
})

const model = mongoose.model("User_strikes", schema)

async function getUserStrikes(client, uid, sid) {
    const filter = {
        user_id: uid,
        server_id: sid
    }

    return client.prisma.userStrikes.upsert({
        where: filter,
        update: { },
        create: filter
    })
}

async function removeStrike(client, uid, sid) {
    await client.prisma.userStrikes.delete({
        where: {
            user_id: uid,
            server_id: sid
        }
    })
}

// Apagando todos os strikes registrados no servidor sobre um membro
async function dropUserGuildStrikes(client, sid) {
    await client.prisma.userStrikes.delete({ where: { server_id: sid } })
}

async function updateUserStrike(client, strike, update) {
    await client.prisma.userStrikes.update({
        where: {
            user_id: strike.user_id,
            server_id: strike.server_id
        },
        data: update
    })
}

module.exports.User_strike = model
module.exports = {
    getUserStrikes,
    removeStrike,
    dropUserGuildStrikes,
    updateUserStrike
}