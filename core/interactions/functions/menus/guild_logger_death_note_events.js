const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {

    const guild = await client.getGuild(interaction.guild.id)
    const update = {}
    // Invertendo os eventos
    Object.keys(interaction.values).forEach(indice => {
        const evento = "death_note_" + interaction.values[indice].split("|")[1]
        update[evento] = !guild[evento]
    })

    await updateGuild(client, guild.id, update)

    // Redirecionando o evento
    const pagina_guia = 2
    require('../../chunks/panel_guild_logger')({ client, user, interaction, pagina_guia })
}