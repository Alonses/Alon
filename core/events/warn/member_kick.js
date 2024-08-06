const { PermissionsBitField } = require("discord.js")

const { dropAllUserGuildWarns } = require("../../database/schemas/User_warns")

module.exports = async ({ client, user, interaction, guild, user_warn, guild_member, bot_member }) => {

    // Verificando se o membro e o executor estão no servidor
    if (!guild_member) return

    // Verificando se a hierarquia do membro que ativou o report é maior que o do alvo e se pode banir membros
    if (interaction.member.roles.highest.position <= guild_member.roles.highest.position || !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
        return client.notify(guild.warn.channel, { content: client.tls.phrase(guild, "events.kick.falta_permissao", [7, 0], user_warn.user_id) })

    // Verificando se a hierarquia do bot é maior que o do alvo e se pode banir membros
    if (bot_member.roles.highest.position <= guild_member.roles.highest.position || !bot_member.permissions.has(PermissionsBitField.Flags.KickMembers)) {

        // Bot não possui permissões para moderar membros
        if (!bot_member.permissions.has(PermissionsBitField.Flags.KickMembers))
            return client.notify(guild.warn.channel, { content: client.tls.phrase(guild, "events.kick.sem_permissao_kick", [7, 0], user_warn.user_id) })

        // Usuário alvo possui mais hierarquia que o bot
        return client.notify(guild.warn.channel, { content: client.tls.phrase(guild, "events.kick.sem_permissao_kick_2", [7, 0], user_warn.user_id) })
    }

    // Expulsando o membro
    await guild_member.kick(user_warn.relatory)
        .then(async () => {
            // Resetando as advertências do usuário
            await dropAllUserGuildWarns(client, user_warn.user_id, guild.server_id)
        })
        .catch(console.error)
}