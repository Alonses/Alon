const { getRoleAssigner, updateRoleAssigner} = require('../../../database/schemas/Guild_role_assigner')

module.exports = async ({ client, user, interaction }) => {

    const roles = [], caso = "global"

    // Invertendo os eventos
    Object.keys(interaction.values).forEach(indice => {
        roles.push(interaction.values[indice].split("|")[1])
    })

    await updateRoleAssigner(client, interaction.guild.id, { ignore: roles.length < 1 ? null : roles.join(".") }, true)

    // Redirecionando o evento
    require('../../chunks/role_assigner')({ client, user, interaction, caso })
}