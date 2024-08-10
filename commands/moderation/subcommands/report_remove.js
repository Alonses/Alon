module.exports = async ({ client, interaction }) => {
    // Redirecionando o evento
    const pagina = 0, dados = `${interaction.user.id}.3`
    await require('../../../core/interactions/functions/buttons/report_remove_user')({
        client,
        interaction,
        dados,
        pagina
    })
}