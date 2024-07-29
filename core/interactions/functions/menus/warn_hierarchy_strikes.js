const { getGuildWarn, updateGuildWarn} = require('../../../database/schemas/Guild_warns')

module.exports = async ({ client, user, interaction, dados }) => {

    const id_warn = parseInt(dados.split(".")[1])
    const strikes = parseInt(dados.split(".")[0])

    const warn = await getGuildWarn(client, interaction.guild.id, id_warn)
    await updateGuildWarn(client, warn.id, { strikes: strikes })

    // Redirecionando o evento
    dados = `x.y.${id_warn}`
    require('../../chunks/warn_configure')({ client, user, interaction, dados })
}