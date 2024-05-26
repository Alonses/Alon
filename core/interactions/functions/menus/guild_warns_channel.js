module.exports = async ({ client, user, interaction, dados }) => {

    const guild = await client.getGuild(interaction.guild.id)

    guild.warn.channel = dados === "none" ? null : dados
    await guild.save()

    // Redirecionando o evento
    const pagina_guia = 2
    require('../../chunks/panel_guild_warns')({ client, user, interaction, pagina_guia })
}