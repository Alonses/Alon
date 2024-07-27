module.exports = async ({ client, user, interaction, dados }) => {
    const acao = parseInt(dados.split(".")[0])

    await updateGuild(client, interaction.guild.id, { warn_hierarchy_reset: acao })

    // Redirecionando o evento
    require('../../chunks/panel_guild_hierarchy_warns')({ client, user, interaction })
}