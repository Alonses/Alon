const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {
    await updateGuild(client, interaction.guild.id, { logger_channel: dados })

    // Redirecionando o evento
    const pagina_guia = 1
    require('../../chunks/panel_guild_logger')({ client, user, interaction, pagina_guia })
}