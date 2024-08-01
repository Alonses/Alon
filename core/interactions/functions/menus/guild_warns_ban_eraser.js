module.exports = async ({ client, user, interaction, dados }) => {
    const { warn_id } = await client.getGuild(interaction.guild.id)
    await client.prisma.guildOptionsWarn.update({
        where: { id: warn_id },
        data: { erase_ban_messages: parseInt(dados) }
    })

    const pagina_guia = 2 // Redirecionando o evento
    require('../../chunks/panel_guild_warns')({ client, user, interaction, pagina_guia })
}