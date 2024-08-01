module.exports = async ({ client, user, interaction, dados }) => {
    const { warn_id } = await client.getGuild(interaction.guild.id)
    await client.prisma.guildOptionsWarn.update({
        where: { id: warn_id },
        data: { channel: dados === "none" ? null : dados }
    })

    // Redirecionando o evento
    const pagina_guia = 2
    require('../../chunks/panel_guild_warns')({ client, user, interaction, pagina_guia })
}