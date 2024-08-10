module.exports = async ({ client, interaction }) => {

    // Redirecionando o evento
    const autor_original = true
    await require('../../../core/interactions/chunks/listas_remover')({client, interaction, autor_original})
}