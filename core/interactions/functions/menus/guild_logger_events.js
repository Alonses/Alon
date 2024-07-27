const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {

    const guild = await client.getGuild(interaction.guild.id)
    const update = {}

    // Invertendo os eventos
    Object.keys(interaction.values).forEach(indice => {
        const evento = "logger_" + interaction.values[indice].split("|")[1]
        update[evento] = !guild.logger[evento]
    })

    await updateGuild(client, guild.id, update)

    // Redirecionando o evento
    require('../../chunks/panel_guild_logger')({ client, user, interaction })
}