module.exports = async ({ client, user, interaction, dados }) => {
    const { erase_id } = await client.getGuild(interaction.guild.id)
    await client.prisma.guildOptionsErase.update({
        where: { id: erase_id },
        data: { timeout: dados }
    })

    // Redirecionando o evento
    const pagina_guia = 1
    require('../../chunks/panel_guild_data')({ client, user, interaction, pagina_guia })
}