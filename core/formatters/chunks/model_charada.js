const { getCharada } = require('../../database/schemas/Charadas')

module.exports = async (client, user, interaction) => {

    const res = await getCharada(client)
    const texto = `🃏 | ${res[0].question}\n\n${res[0].answer}`

    if (interaction)
        interaction.reply({
            content: texto,
            ephemeral: client.decider(user?.conf.ghost_mode, 0)
        })
    else client.sendDM(user, { content: texto }, true)
}