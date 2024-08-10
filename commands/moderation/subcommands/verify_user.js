module.exports = async ({ client, interaction }) => {
    // Redirecionando o evento
    await require('../../../core/interactions/chunks/verify_user')({client, interaction})
}