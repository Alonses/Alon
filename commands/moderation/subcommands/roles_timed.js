const { PermissionsBitField } = require('discord.js')

const { getUserRole } = require('../../../core/database/schemas/User_roles.js')

module.exports = async ({ client, user, interaction }) => {

    // Permissão para atualizar os cargos de membros do servidor
    if (!await client.permissions(interaction, client.id(), [PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.ModerateMembers]))
        return client.tls.reply(interaction, user, "mode.roles.sem_permissao", true, 7)

    if (!await client.rolePermissions(interaction, interaction.options.getRole("role").id, [PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.Administrator])) // Cargo informado não é válido
        return interaction.reply({
            content: ":passport_control: | Selecione um cargo que não contenha permissões de moderação e não seja gerenciado pelo discord (como por impulsos).",
            ephemeral: true
        })

    // Membro já possui o cargo mencionado
    if (await client.hasRole(interaction, interaction.options.getRole("role").id, interaction.options.getUser("user").id))
        return interaction.reply({
            content: ":passport_control: | Este membro já possui o cargo informado, tente novamente com um cargo que ele ainda não possua.",
            ephemeral: true
        })

    const cached_role = client.getGuildRole(interaction, interaction.options.getRole("role").id)
    const bot_member = await client.getMemberGuild(interaction.guild.id, client.id())

    if (cached_role.position > bot_member.roles.highest.position)
        return interaction.reply({
            content: ":passport_control: | O cargo mencionado é maior que o meu! Não posso atribuir este cargo ao membro.",
            ephemeral: true
        })

    const guild = await client.getGuild(interaction.guild.id)

    // Servidor sem canal de avisos definido
    if (!guild.timed_roles_channel)
        return interaction.reply({
            content: ":radio: | Antes de utilizar este comando você deve configurar um canal de avisos para notificarmos os membros sobre a atribuição!!\n\nVocê pode configurar o canal através do </panel guild:1107163338930126869> ou através do </conf guild:1094346210636214304>, ambos em `⌚ Timed roles`",
            ephemeral: true
        })

    const user_alvo = interaction.options.getUser("user")
    const role = await getUserRole(user_alvo.id, interaction.guild.id, client.timestamp())

    if (guild.timed_roles_timeout) // Sincroniza o cargo temporário com o tempo minimo do servidor
        role.timeout = guild.timed_roles_timeout

    role.rid = interaction.options.getRole("role").id
    role.nick = user_alvo.username

    // Salvando dados do moderador que acionou o comando
    role.assigner = interaction.user.id
    role.assigner_nick = interaction.user.username

    if (interaction.options?.getString("reason"))
        role.relatory = interaction.options.getString("reason")

    await role.save()

    return require('../../../core/interactions/chunks/role_timed_assigner.js')({ client, user, interaction })
}