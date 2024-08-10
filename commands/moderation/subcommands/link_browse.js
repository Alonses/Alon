module.exports = async ({ client, interaction }) => {
    // Redirecionando o evento
    const pagina = 0, dados = `${interaction.user.id}.2`
    await require('../../../core/interactions/functions/buttons/spam_link_button')({
        client,
        interaction,
        dados,
        pagina
    })
}