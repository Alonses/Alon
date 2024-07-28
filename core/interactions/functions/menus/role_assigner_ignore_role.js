const { getRoleAssigner, updateRoleAssigner} = require('../../../database/schemas/Guild_role_assigner')

module.exports = async ({ client, user, interaction }) => {

    const roles = [], caso = "global"

    // Invertendo os eventos
    Object.keys(interaction.values).forEach(indice => {
        roles.push(interaction.values[indice].split("|")[1])
    })

    const roleAssigner = await getRoleAssigner(client, interaction.guild.id, caso)

    await updateRoleAssigner(client, roleAssigner.id, { ignore: roles.length < 1 ? null : roles.join(".") })

    // Redirecionando o evento
    require('../../chunks/role_assigner')({ client, user, interaction, caso })
}