const { getModule, updateModule} = require("../../../database/schemas/User_modules")

module.exports = async ({ client, user, interaction, dados }) => {

    const timestamp = parseInt(dados.split(".")[1])
    const dia = parseInt(dados.split(".")[2])

    // Alterando o dia do módulo
    const modulo = await getModule(client, interaction.user.id, timestamp)

    await updateModule(client, modulo.id, { days: dia })

    // Redirecionando o evento
    require('../../chunks/verify_module')({ client, user, interaction, dados })
}