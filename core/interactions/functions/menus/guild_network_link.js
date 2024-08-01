const { randomString } = require("../../functions/random_string")

module.exports = async ({ client, user, interaction, dados }) => {

    const guild = await client.getGuild(interaction.guild.id, { network: true })

    if (!guild.network.link) // Criando um link de network para o servidor
        await client.prisma.guildOptionsNetwork.update({
            where: { id: guild.network_id },
            data: { link: await createNetworkLink(client) }
        })

    // Atualizando o link dos servidores
    for (let i = 0; i < interaction.values.length; i++) {

        const internal_guild = await client.getGuild(interaction.values[i].split("|")[1])
        const update = {}

        // Desvinculando o servidor
        if (internal_guild.network.link === guild.network.link) {
            update.enabled = false
            update.link = null
        } else { // Vinculando o servidor
            update.enabled = true
            update.link = guild.network.link
        }

        await client.prisma.guildOptionsNetwork.update({
            where: { id: internal_guild.network_id },
            data: update
        })
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