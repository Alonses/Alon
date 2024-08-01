module.exports = async ({ client, user, interaction, dados }) => {
    const { network_id } = await client.getGuild(interaction.guild.id)
    await client.prisma.guildOptionsNetwork.update({
        where: { id: network_id },
        data: { channel: dados === "none" ? null : dados }
    })

    const pagina_guia = 1 // Redirecionando o evento
    require('../../chunks/panel_guild_network')({ client, user, interaction, pagina_guia })
}