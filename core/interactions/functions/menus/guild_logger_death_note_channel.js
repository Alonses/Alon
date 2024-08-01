module.exports = async ({ client, user, interaction, dados }) => {
    const { death_note_id } = await client.getGuild(interaction.guild.id)
    await client.prisma.guildOptionsDeathNote.update({
        where: { id: death_note_id },
        data: { channel: dados }
    })

    // Redirecionando o evento
    const pagina_guia = 2
    require('../../chunks/panel_guild_logger')({ client, user, interaction, pagina_guia })
}