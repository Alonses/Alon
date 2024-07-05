const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    nome: { type: String, default: null },
    tipo: { type: String, default: "game" },
    link: { type: String, default: null },
    preco: { type: Number, default: 0 },
    expira: { type: Number, default: null },
    descricao: { type: String, default: null },
    thumbnail: { type: String, default: null }
})

const model = mongoose.model("Game", schema)

async function getGames(client) {
    await client.prisma.game.findMany({ orderBy: { expire: "asc" } })
}

// Verifica se um game já foi registrado
async function verifyGame(client, game) {
    return (await client.prisma.game.count({ where: { name: game.name }})) > 0
}

async function createGame(client, game) {
    await client.prisma.game.upsert({
        where: { name: game.name },
        update: game,
        create: game
    })
}

// Apagando um game
async function dropGame(client, game) {
    await client.prisma.game.delete({ where: { name: game.name } })
}

async function verifyInvalidGames(client) {
    await client.prisma.game.deleteMany({ where: { expire: { lt: parseInt(new Date().getTime() / 1000) } } })
}

module.exports.Game = model
module.exports = {
    getGames,
    verifyGame,
    createGame,
    dropGame,
    verifyInvalidGames
}