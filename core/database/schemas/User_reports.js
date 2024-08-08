const mongoose = require("mongoose")

// uid -> User ID
// sid -> Server ID

const schema = new mongoose.Schema({
    uid: { type: String, default: null },
    sid: { type: String, default: null },
    nick: { type: String, default: null },
    issuer: { type: String, default: null },
    issuer_nick: { type: String, default: null },
    relatory: { type: String, default: null },
    timestamp: { type: Number, default: null },
    archived: { type: Boolean, default: false },
    auto: { type: Boolean, default: false }
})

const model = mongoose.model("Report", schema)

async function getReport(client, uid, sid) {
    const filter = {
        user_id: uid,
        server_id: sid
    }

    return client.prisma.userReports.upsert({
        where: { id: filter },
        update: { },
        create: filter
    })
}

async function dropReport(client, uid, sid) {
    await client.prisma.userReports.delete({
        where: {
            id: {
                user_id: uid,
                server_id: sid
            }
        }
    })
}

async function getUserReports(client, uid) {
    return client.prisma.userReports.findMany({
        where: {
            user_id: uid,
            archived: false
        }
    })
}

async function getReportedUsers(client) {
    return client.prisma.userReports.findMany({
        where: { archived: false },
        orderBy: { timestamp: "desc" }
    })
}

async function checkUserGuildReported(client, sid) {
    return client.prisma.userReports.findMany({
        where: {
            server_id: sid,
            archived: false
        },
        orderBy: { timestamp: "desc" },
        take: 50
    })
}

async function updateGuildReport(client, sid) {

    // Movendo os reportes para o servidor do Alonsal
    const reports = await client.prisma.userReports.findMany({ where: { server_id: sid } })

    for (const report of reports)
        await client.prisma.userReports.update({
            where: {
                id: {
                    user_id: report.user_id,
                    server_id: report.server_id
                }
            },
            data: { server_id: process.env.guild_id }
        })
}

async function updateUserReport(client, report, update) {
    await client.prisma.userReports.update({
        where: {
            id: {
                user_id: report.user_id,
                server_id: report.server_id
            }
        },
        data: update
    })
}

module.exports.Report = model
module.exports = {
    getReport,
    dropReport,
    getUserReports,
    getReportedUsers,
    checkUserGuildReported,
    updateGuildReport,
    updateUserReport
}