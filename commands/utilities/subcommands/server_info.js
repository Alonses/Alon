module.exports = async ({ client, interaction }) => {

    // Redirecionando o evento
    const autor_original = true
    await require("../../../core/formatters/chunks/model_server_info")({client, interaction, autor_original})
}