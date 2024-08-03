const { getModule, updateModule} = require('../../../database/schemas/User_modules')

module.exports = async ({ client, user, interaction, dados }) => {

    const timestamp = parseInt(dados.split(".")[2])
    const data = parseInt(dados.split(".")[1])

    const modulo = await getModule(client, interaction.user.id, timestamp)

    if (!modulo)
        return interaction.update({
            content: client.tls.phrase(user, "misc.modulo.modulo_inexistente", 1),
            embeds: [],
            components: [row],
            ephemeral: true
        })

    await updateModule(client, modulo.id, { data: data })

    require('./modules')({ client, user, interaction, dados })
}