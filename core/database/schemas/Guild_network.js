const mongoose = require("mongoose")

const { getNetworkedGuilds } = require("./Guild")
const { randomString } = require("../../functions/random_string")

const schema = new mongoose.Schema({
    name: { type: String, default: null },
    link: { type: String, default: null }
})

const model = mongoose.model("Network", schema)

async function createNetworkLink(client) {

    let new_link = ''

    do {
        new_link = randomString(10, client)
    } while (await model.exists({ link: new_link }))

    await model.create({
        link: new_link
    })

    return new_link
}

async function dropNetwork(link) {
    await model.findOneAndDelete({
        link: link
    })
}

async function getLink(client, link) {
    return await getNetworkedGuilds(client, link)
}

module.exports.Network = model
module.exports = {
    createNetworkLink,
    dropNetwork,
    getLink
}