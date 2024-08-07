const { getTimedRoleAssigner, updateUserRole} = require('../../../database/schemas/User_roles')

module.exports = async ({ client, user, interaction, dados }) => {

    const tempo_exclusao = parseInt(dados.split(".")[0])
    const user_alvo = dados.split(".")[1]

    // Atualizando o tempo de expiração do cargo
    const cargo = await getTimedRoleAssigner(client, user_alvo, interaction.guild.id)
    await updateUserRole(client, cargo.id, { timeout: tempo_exclusao })

    // Redirecionando o evento
    dados = { id: user_alvo }
    await require('../../chunks/role_timed_assigner')({client, user, interaction, dados})
}