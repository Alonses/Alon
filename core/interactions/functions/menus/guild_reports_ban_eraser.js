const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {
    await updateGuild(client, interaction.guild.id, { reports_erase_ban_messages: parseInt(dados) })

    const pagina_guia = 1 // Redirecionando o evento
    require('../../chunks/panel_guild_external_reports')({ client, user, interaction, pagina_guia })
}