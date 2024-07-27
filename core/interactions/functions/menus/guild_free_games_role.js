const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {
    await updateGuild(client, interaction.guild.id, {games_role: dados })

    // Redirecionando o evento
    require('../../chunks/panel_guild_free_games')({ client, user, interaction })
}