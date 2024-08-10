module.exports = async ({ client, interaction }) => {
    // Redirecionando o evento
    await require('../../../core/formatters/chunks/model_charada')(client, interaction)
}