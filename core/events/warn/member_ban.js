const { PermissionsBitField } = require("discord.js")

const { dropAllUserGuildWarns } = require("../../database/schemas/User_warns")

const { banMessageEraser } = require('../../formatters/patterns/timeout')

module.exports = async ({ client, user, interaction, guild, user_warn, guild_member, bot_member }) => {

    // Verificando se o membro e o executor estão no servidor
    if (!guild_member) return

    // Verificando se a hierarquia do membro que ativou o report é maior que o do alvo e se pode banir membros
    if (interaction.member.roles.highest.position <= guild_member.roles.highest.position || !interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
        return client.notify(guild.warn.channel, { content: client.tls.phrase(guild, "events.ban.falta_permissao", [7, 0], user_warn.uid) })

    // Verificando se a hierarquia do bot é maior que o do alvo e se pode banir membros
    if (bot_member.roles.highest.position <= guild_member.roles.highest.position || !bot_member.permissions.has(PermissionsBitField.Flags.BanMembers)) {

        // Bot não possui permissões para moderar membros
        if (!bot_member.permissions.has(PermissionsBitField.Flags.BanMembers))
            return client.notify(guild.warn.channel, { content: client.tls.phrase(guild, "events.ban.sem_permissao_ban", [7, 0], user_warn.uid) })

        // Usuário alvo possui mais hierarquia que o bot
        return client.notify(guild.warn.channel, { content: client.tls.phrase(guild, "events.ban.sem_permissao_ban_hierarquia", [7, 0], user_warn.uid) })
    }

    // Banindo o membro
    await guild_member.ban({ // Banindo o usuário do servidor automaticamente
        reason: user_warn.relatory,
        deleteMessageSeconds: banMessageEraser[guild.warn.erase_ban_messages]
    }).then(async () => {
        await dropAllUserGuildWarns(client, user_warn.user_id, guild.server_id) // Reiniciando as advertências do usuário no servidor
    }).catch(console.error)
}