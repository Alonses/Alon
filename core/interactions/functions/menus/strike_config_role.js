const { getGuildStrike, updateGuildStrike} = require('../../../database/schemas/Guild_strikes')

module.exports = async ({ client, user, interaction, dados }) => {

    let cargo = dados.split(".")[0]
    const id_strike = parseInt(dados.split("/")[1])

    // Atualizando o cargo do strike
    const strike = await getGuildStrike(client, interaction.guild.id, id_strike)

    const data = { role: cargo === "none" ? null : cargo }
    if (!strike.role) data.timed_role_status = false

    await updateGuildStrike(client, strike.id, data)

    // Redirecionando o evento
    dados = `x.y.${id_strike}`
    require('../../chunks/strike_configure')({ client, user, interaction, dados })
}