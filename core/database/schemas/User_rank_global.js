const mongoose = require("mongoose")

// uid -> User ID

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    sid: { type: String, default: null },
    nickname: { type: String, default: null },
    xp: { type: Number, default: 0 }
})

const model = mongoose.model("Rankobal", schema)

async function getRankGlobal(client, limit = 50) {
    return client.prisma.userRankGlobal.findMany({
        orderBy: { xp: "desc" },
        take: limit
    })
}

async function getUserGlobalRank(client, uid, xp, nickname, sid) {
    return client.prisma.userRankGlobal.upsert({
        where: { user_id: uid },
        update: { },
        create: {
            user_id: uid,
            server_id: sid,
            xp: xp,
            nickname: nickname
        }
    })
}

async function findUserGlobalRankIndex(client, uid) {
    return client.prisma.userRankGlobal.findUnique({ where: { user_id: uid } })
}

async function dropUserGlobalRank(client, uid) {
    await client.prisma.userRankGlobal.delete({ where: { user_id: uid } })
}

module.exports.Rankobal = model
module.exports = {
    getRankGlobal,
    getUserGlobalRank,
    dropUserGlobalRank,
    findUserGlobalRankIndex
}