const { languagesMap } = require('../../../formatters/patterns/user')
const {updateUser} = require("../../../database/schemas/User");

module.exports = async ({ client, user, interaction, dados }) => {

    // Alterando o idioma do usuário para a nova escolha
    await updateUser(client, user.id, { lang: languagesMap[dados][0] })

    // Redirecionando o evento
    await require('../../chunks/browse_help')({client, user, interaction})
}