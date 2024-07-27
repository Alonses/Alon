const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {
    await updateGuild(client, interaction.guild.id, { spam_trigger_amount: parseInt(dados) })

    // Redirecionando o evento
    const pagina_guia = 2
    require('../../chunks/panel_guild_anti_spam')({ client, user, interaction, pagina_guia })
}