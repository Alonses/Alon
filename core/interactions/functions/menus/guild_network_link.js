const {updateGuild} = require("../../../database/schemas/Guild");
const { randomString } = require("../../functions/random_string")

module.exports = async ({ client, user, interaction, dados }) => {

    const guild = await client.getGuild(interaction.guild.id)

    if (!guild.network_link) // Criando um link de network para o servidor
        await updateGuild(client, guild.id, { network_link: await createNetworkLink(client)})

    // Atualizando o link dos servidores
    for (let i = 0; i < interaction.values.length; i++) {

        const internal_guild = await client.getGuild(interaction.values[i].split("|")[1])
        const update = {}

        // Desvinculando o servidor
        if (internal_guild.network_link === guild.network_link) {
            update.conf_network = false
            update.network_link = null
        } else { // Vinculando o servidor
            update.conf_network = true
            update.network_link = guild.network_link
        }

        await updateGuild(client, internal_guild.id, update)
    }

    // Redirecionando o evento
    require('../../chunks/panel_guild_network')({ client, user, interaction })
}

async function createNetworkLink(client) {
    let new_link = ''

    do {
        new_link = randomString(10, client)
    } while (await client.prisma.guild.findFirst({ where: { network_link: new_link } }))

    return new_link
}