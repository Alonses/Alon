const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {

    const guild = await client.getGuild(interaction.guild.id)
    await updateGuild(client, guild.id, { games_channel: dados })

    if (!guild.games_role) { // Redirecionando para escolher o cargo
        dados = `${interaction.user.id}.3`
        return require('../buttons/guild_free_games_button')({ client, user, interaction, dados })
    }

    // Redirecionando o evento
    require('../../chunks/panel_guild_free_games')({ client, user, interaction })
}