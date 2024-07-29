const { getGuildWarn, updateGuildWarn} = require('../../../database/schemas/Guild_warns')

module.exports = async ({ client, user, interaction, dados }) => {

    const tempo_mute = parseInt(dados.split(".")[0])
    const id_warn = parseInt(dados.split(".")[1])

    // Atualizando o tempo de mute da advertência
    const warn = await getGuildWarn(client, interaction.guild.id, id_warn)
    await updateGuildWarn(client, warn.id, { timeout: tempo_mute })

    // Redirecionando o evento
    dados = `x.y.${id_warn}`
    require('../../chunks/warn_configure')({ client, user, interaction, dados })
}