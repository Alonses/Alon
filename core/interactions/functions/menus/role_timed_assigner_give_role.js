const { getTimedRoleAssigner, updateUserRole} = require('../../../database/schemas/User_roles')

module.exports = async ({ client, user, interaction, dados }) => {

    const id_cargo = dados.split(".")[0]
    const user_alvo = dados.split(".")[1]

    const role = await getTimedRoleAssigner(client, user_alvo, interaction.guild.id)
    await updateUserRole(client, role.id, { role_id: id_cargo })

    dados = {
        id: user_alvo,
        role_id: id_cargo
    }

    // Redirecionando o evento
    await require('../../chunks/role_timed_assigner')({client, user, interaction, dados})
}