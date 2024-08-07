const { filterRemovedTimedRole, dropUserTimedRole } = require('../../../database/schemas/User_roles')
const { atualiza_roles } = require('../../../auto/triggers/user_roles')

module.exports = async ({ client, guild, dados }) => {

    const user_alvo = dados[0].user
    let removidos = [], old_member = dados[0], new_member = dados[1]

    if (old_member.roles.cache.size > new_member.roles.cache.size)
        old_member.roles.cache.forEach(role => {
            if (!new_member.roles.cache.has(role.id))
                removidos.push(role.id)
        })

    // Verificando se o membro possuia um cargo temporário vinculado
    if ((await filterRemovedTimedRole(client, user_alvo.id, guild.server_id, removidos[0])).length > 0) {

        // Excluindo o vinculo do cargo com o membro
        await dropUserTimedRole(client, user_alvo.id, guild.server_id, removidos[0])

        // Atualizando a lista de cargos temporários em cache
        await atualiza_roles(client)
    }
}