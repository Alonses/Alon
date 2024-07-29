const { getGuildWarn, updateGuildWarn} = require('../../../database/schemas/Guild_warns')

module.exports = async ({ client, user, interaction, dados }) => {

    let cargo = dados.split(".")[0]
    const id_warn = parseInt(dados.split("/")[1])

    // Atualizando o cargo da advertência
    const warn = await getGuildWarn(client, interaction.guild.id, id_warn)
    let data = cargo === "none" ? {
        role: null,
        timed_role_status: false
    } : {role: cargo}


    await updateGuildWarn(client, warn.id, data)

    // Redirecionando o evento
    dados = `x.y.${id_warn}`
    require('../../chunks/warn_configure')({client, user, interaction, dados})
}