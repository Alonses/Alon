module.exports = async ({ client, user, interaction, dados }) => {
    const { warn_id } = await client.getGuild(interaction.guild.id)
    await client.prisma.guildOptionsWarn.update({
        where: { id: warn_id },
        data: { hierarchy_strikes: parseInt(dados) }
    })

    // Redirecionando o evento
    require('../../chunks/panel_guild_hierarchy_warns')({ client, user, interaction })
}