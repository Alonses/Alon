const mongoose = require("mongoose")

// qid -> Question ID

const schema = new mongoose.Schema({
    qid: { type: Number, default: 0 },
    question: { type: String, default: null },
    answer: { type: String, default: null }
})

const model = mongoose.model("Charada", schema)

async function createCharada(client, value) {
    await client.prisma.charada.create({
        data: value
    })
}

async function getCharada(client) {
    return await client.prisma.$queryRaw`
    SELECT * FROM "Charada"
    ORDER BY RANDOM()
    LIMIT 1;`
}

module.exports.Charada = model
module.exports = {
    getCharada,
    createCharada
}