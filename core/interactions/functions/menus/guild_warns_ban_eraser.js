const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {
    await updateGuild(client, interaction.guild.id, { warn_erase_ban_messages: parseInt(dados) })

    const pagina_guia = 2 // Redirecionando o evento
    require('../../chunks/panel_guild_warns')({ client, user, interaction, pagina_guia })
}