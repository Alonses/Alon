module.exports = async ({ client, user, interaction, dados }) => {

    const guild = await client.getGuild(interaction.guild.id, { death_note: true })
    const update = {}
    // Invertendo os eventos
    Object.keys(interaction.values).forEach(indice => {
        const evento = interaction.values[indice].split("|")[1]
        update[evento] = !guild.death_note[evento]
    })

    await client.prisma.guildOptionsDeathNote.update({
        where: { id: guild.death_note_id },
        data: update
    })

    // Redirecionando o evento
    const pagina_guia = 2
    require('../../chunks/panel_guild_logger')({ client, user, interaction, pagina_guia })
}