const mongoose = require("mongoose")

// uid -> User ID

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    operation: { type: String, default: null },
    type: { type: Boolean, default: false }, // false -> saída, true -> entrada
    value: { type: Number, default: 0 },
    timestamp: { type: Number, default: null }
})

const model = mongoose.model("Statement", schema)

async function registryStatement(client, uid, operation, type, value) {

    const statements = await getUserStatements(client, uid)
    if (statements.length > 9) //  Exclui a última movimentação após 10 novas entradas
        await dropUserStatement(client, uid, statements[9].timestamp)

    await client.prisma.userStatement.create({
        data: {
            user_id: uid,
            operation: operation,
            type: type,
            value: value,
            timestamp: client.timestamp()
        }
    })
}

async function getUserStatements(client, uid) {
    return client.prisma.userStatement.findMany({
        where: { user_id: uid },
        orderBy: { timestamp: "desc" }
    })
}

async function dropUserStatement(client, uid, timestamp) {
    await client.prisma.userStatement.deleteMany({
        where: {
            user_id: uid,
            timestamp: timestamp
        }
    })
}

async function dropAllUserStatements(client, uid) {
    await client.prisma.userStatement.deleteMany({ where: { user_id: uid } })
}

module.exports.Statement = model
module.exports = {
    registryStatement,
    getUserStatements,
    dropUserStatement,
    dropAllUserStatements
}