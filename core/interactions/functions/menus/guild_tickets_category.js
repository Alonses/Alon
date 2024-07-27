const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {
    await updateGuild(client, interaction.guild.id, { tickets_category: dados })

    // Redirecionando o evento
    require('../../chunks/panel_guild_tickets')({ client, user, interaction })
}