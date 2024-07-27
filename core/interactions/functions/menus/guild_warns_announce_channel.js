const {updateGuild} = require("../../../database/schemas/Guild");
module.exports = async ({ client, user, interaction, dados }) => {

    const guild = await client.getGuild(interaction.guild.id)
    const update = {}
    update.warn_announce_channel = dados === "none" ? null : dados
    update.warn_announce_status = guild.warn_announce_channel || !guild.warn_announce_status // Desativando o recurso de advertências públicas caso não haja um canal definido

    await updateGuild(client, guild.id, update)

    // Redirecionando o evento
    const pagina_guia = 1
    require('../../chunks/panel_guild_warns')({ client, user, interaction, pagina_guia })
}