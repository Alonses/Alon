const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {
    await updateGuild(client, interaction.guild.id, { timed_roles_timeout: dados })

    // Redirecionando o evento
    require('../../chunks/panel_guild_timed_roles')({ client, user, interaction })
}