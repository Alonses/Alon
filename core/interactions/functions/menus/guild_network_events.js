module.exports = async ({ client, user, interaction, dados }) => {

    const guild = await client.getGuild(interaction.guild.id)
    const update = {}

    // Invertendo os eventos
    Object.keys(interaction.values).forEach(indice => {
        const evento = interaction.values[indice].split("|")[1]
        update[evento] = !guild[evento]
    })

    await client.prisma.guildOptionsNetwork.update({
        where: { id: guild.network_id },
        data: update
    })

    // Redirecionando o evento
    require('../../chunks/panel_guild_network')({ client, user, interaction })
}