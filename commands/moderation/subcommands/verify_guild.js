module.exports = async ({ client, interaction }) => {
    // Redirecionando o evento
    await require('../../../core/interactions/chunks/panel_guild_verify')({client, interaction})
}