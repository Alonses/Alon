module.exports = async ({ client, user, interaction, dados }) => {
    const { logger_id } = await client.getGuild(interaction.guild.id)

    await client.prisma.guildOptionsLogger.update({
        where: { id: logger_id },
        data: { channel: dados }
    })

    // Redirecionando o evento
    const pagina_guia = 1
    require('../../chunks/panel_guild_logger')({ client, user, interaction, pagina_guia })
}