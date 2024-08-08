const mongoose = require("mongoose")

// uid -> User ID
// sid -> Server ID
// cid -> Channel ID

const schema = new mongoose.Schema({
    sid: { type: String, default: null },
    uid: { type: String, default: null },
    cid: { type: String, default: null }
})

const model = mongoose.model("Ticket", schema)

async function getTicket(client, sid, uid) {
    const filter = {
        user_id: uid,
        server_id: sid
    }

    return client.prisma.userTickets.upsert({
        where: { id: filter },
        update: { },
        create: filter
    })
}

// Apaga o ticket de denúncia do servidor
async function dropTicket(client, sid, uid) {
    await client.prisma.userTickets.delete({
        where: {
            id: {
                user_id: uid,
                server_id: sid
            }
        }
    })
}

// Apaga todos os tickets criados no servidor
async function dropAllGuildTickets(client, sid) {
    await client.prisma.userTickets.deleteMany({ where: { server_id: sid } })
}

// Apaga todos os tickets criados por um usuário
async function dropAllUserTickets(client, uid) {
    await client.prisma.userTickets.deleteMany({ where: { user_id: uid } })
}

module.exports.Ticket = model
module.exports = {
    getTicket,
    dropTicket,
    dropAllGuildTickets,
    dropAllUserTickets
}