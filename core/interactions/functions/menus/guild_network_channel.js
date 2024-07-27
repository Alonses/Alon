const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {

    await updateGuild(client, interaction.guild.id, { network_channel: dados === "none" ? null : dados })

    const pagina_guia = 1 // Redirecionando o evento
    require('../../chunks/panel_guild_network')({ client, user, interaction, pagina_guia })
}