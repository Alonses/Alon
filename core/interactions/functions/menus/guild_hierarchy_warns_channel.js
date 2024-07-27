const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {
    await updateGuild(client, interaction.guild.id, { warn_hierarchy_channel: dados })

    // Redirecionando o evento
    require('../../chunks/panel_guild_hierarchy_warns')({ client, user, interaction })
}