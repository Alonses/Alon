const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {
    await updateGuild(client, interaction.guild.id, { spam_timeout: dados })

    // Redirecionando o evento
    require('../../chunks/panel_guild_anti_spam')({ client, user, interaction })
}