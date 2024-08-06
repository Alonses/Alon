const mongoose = require("mongoose")

// uid -> userID

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    vote: { type: String, default: null },
    timestamp: { type: Number, default: null }
})

const model = mongoose.model("Vote", schema)

async function registryVote(client, uid) {
    return await client.prisma.vote.upsert({
        where: { id: uid },
        update: { },
        create: { id: uid }
    })
}

async function getVotes(client) {

    const total = { }
    const votes = await client.prisma.vote.findMany()
    total.qtd = votes.length

    // Soma todos os votos registrados
    votes.forEach(voto => {

        if (total[voto.vote])
            total[voto.vote]++
        else
            total[voto.vote] = 1
    })

    return total
}

async function verifyUser(client, uid) {
    return await client.prisma.findUnique({ where: { id: uid } })
}


module.exports.Vote = model
module.exports = {
    getVotes,
    verifyUser,
    registryVote
}