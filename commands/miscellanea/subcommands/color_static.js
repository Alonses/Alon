module.exports = async ({ client, interaction }) => {

    // Redirecionando o evento
    await require("../../../core/interactions/chunks/static_color")({client, interaction})
}