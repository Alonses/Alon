const mongoose = require("mongoose")

// sid -> Server ID

const links_oficiais = ["youtu.be", "youtube.com", "google.com", "tenor.com", "discordapp.com"]

const schema = new mongoose.Schema({
    sid: { type: String, default: null },
    link: { type: String, default: null },
    timestamp: { type: String, default: null },
    valid: { type: Boolean, default: false }
})

const model = mongoose.model("Spam_Link", schema)

// Verificando se os links suspeitos estão registrados
async function verifySuspiciousLink(client, link) {

    if (typeof link === "object")
        for (let i = 0; i < link.length; i++) {

            link[i] = link[i].split(")")[0]

            if (!links_oficiais.includes(link[i].split("/")[0]))
                if (await getSuspiciousLink(client, link[i])) return true
        }
    else if (!links_oficiais.includes(link.split("/")[0]))
        if (await getSuspiciousLink(client, link.split(")")[0])) return true

    return false
}

async function getSuspiciousLink(client, link) {

    if (link.includes(")"))
        link = link.split(")")[0]

    if (link.includes("||"))
        link = link.split("||")[0]

    return client.prisma.spamLinks.findFirst({where: {link: link.trim()}});
}

async function getCachedSuspiciousLink(client, timestamp) {
    return client.prisma.spamLinks.findFirst({where: { timestamp: timestamp }});
}

async function registerSuspiciousLink(client, link, guild_id, timestamp) {

    let registrados = []
    link = link.replaceAll(" ", "")

    if (!await verifySuspiciousLink(client, link)) {

        if (link.includes(")"))
            link = link.split(")")[0]

        if (link.includes("("))
            link = link.split("(")[1]

        await client.prisma.spamLinks.create({
            data: {
                link: link,
                guild_id: guild_id,
                timestamp: timestamp,
                valid: true
            }
        })

        registrados.push(link.split("").join(" "))
    }

    return registrados
}

// Registrando um link suspeito provisório
async function registerCachedSuspiciousLink(client, link, guild_id, timestamp) {
    return client.prisma.spamLinks.create({
        data: {
            link: link,
            guild_id: guild_id,
            timestamp: timestamp
        }
    })
}

async function getAllGuildSuspiciousLinks(client, guild_id) {
    return client.prisma.spamLinks.findMany({
        where: {
            guild_id: guild_id
        },
        orderBy: {
            timestamp: "desc"
        }
    });
}

async function listAllSuspiciousLinks(client) {
    return client.prisma.spamLinks.findMany({orderBy: {timestamp: "desc"}});
}

async function updateGuildSuspectLink(client, sid) {

    // Movendo os links para o servidor do Alonsal
    await client.prisma.spamLinks.updateMany({
        where: {
            guild_id: sid
        },
        data: {
            guild_id: process.env.guild_id
        }
    })
}

module.exports.Spam_Link = model
module.exports = {
    getSuspiciousLink,
    verifySuspiciousLink,
    listAllSuspiciousLinks,
    registerSuspiciousLink,
    registerCachedSuspiciousLink,
    getCachedSuspiciousLink,
    getAllGuildSuspiciousLinks,
    updateGuildSuspectLink
}