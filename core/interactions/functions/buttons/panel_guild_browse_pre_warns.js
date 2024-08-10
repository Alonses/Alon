module.exports = async ({ client, interaction, dados }) => {

    const id_alvo = dados.split(".")[2]

    dados = { id: id_alvo } // Redirecionando o evento
    await require('../../chunks/panel_guild_browse_pre_warns.js')({client, interaction, dados})
}