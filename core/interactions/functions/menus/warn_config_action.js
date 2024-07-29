const { getGuildWarn, updateGuildWarn} = require('../../../database/schemas/Guild_warns')

module.exports = async ({ client, user, interaction, dados }) => {

    const acao = dados.split(".")[0]
    const id_warn = parseInt(dados.split(".")[1])

    // Atualizando a punição da advertência
    const warn = await getGuildWarn(client, interaction.guild.id, id_warn)
    await updateGuildWarn(client, warn.id, { action: acao === "none" ? null : acao })

    // Redirecionando o evento
    dados = `x.y.${id_warn}`
    require('../../chunks/warn_configure')({ client, user, interaction, dados })
}