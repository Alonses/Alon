const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {
    const acao = parseInt(dados.split(".")[0])

    await updateGuild(client, interaction.guild.id, { warn_reset: acao })

    // Redirecionando o evento
    const pagina_guia = 2
    require('../../chunks/panel_guild_warns')({ client, user, interaction, pagina_guia })
}