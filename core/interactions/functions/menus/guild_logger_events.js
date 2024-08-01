module.exports = async ({ client, user, interaction, dados }) => {

    const guild = await client.getGuild(interaction.guild.id)
    const update = {}

    // Invertendo os eventos
    Object.keys(interaction.values).forEach(indice => {
        const evento = interaction.values[indice].split("|")[1]
        update[evento] = !guild[evento]
    })

    await client.prisma.guildOptionsLogger.update({
        where: { id: guild.logger_id },
        data: update
    })

    // Redirecionando o evento
    require('../../chunks/panel_guild_logger')({ client, user, interaction })
}