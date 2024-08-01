module.exports = async ({ client, user, interaction, dados }) => {
    const { spam_id } = await client.getGuild(interaction.guild.id)
    await client.prisma.guildOptionsSpam.update({
        where: { id: spam_id },
        data: { trigger_amount: parseInt(dados) }
    })

    // Redirecionando o evento
    const pagina_guia = 2
    require('../../chunks/panel_guild_anti_spam')({ client, user, interaction, pagina_guia })
}