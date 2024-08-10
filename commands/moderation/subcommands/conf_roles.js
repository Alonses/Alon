const { PermissionsBitField } = require('discord.js')

module.exports = async ({ client, interaction }) => {
    const user = await client.getUser(interaction.user.id)
    // Permissão para atualizar os cargos de membros do servidor
    if (!await client.permissions(interaction, client.id(), PermissionsBitField.Flags.ManageRoles))
        return client.tls.reply(interaction, user, "mode.roles.sem_permissao", true, 7)

    return require('../../../core/interactions/chunks/role_assigner.js')({ client, interaction })
}