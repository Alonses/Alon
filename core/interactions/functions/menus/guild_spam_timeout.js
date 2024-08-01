module.exports = async ({ client, user, interaction, dados }) => {
    const { spam_id } = await client.getGuild(interaction.guild.id)
    await client.prisma.guildOptionsSpam.update({
        where: { id: spam_id },
        data: { timeout: dados }
    })

    // Redirecionando o evento
    require('../../chunks/panel_guild_anti_spam')({ client, user, interaction })
}