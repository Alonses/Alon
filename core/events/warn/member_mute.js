const { PermissionsBitField } = require("discord.js")

const { listAllGuildWarns } = require("../../database/schemas/Guild_warns")

const { spamTimeoutMap } = require("../../formatters/patterns/timeout")

module.exports = async ({ client, user, interaction, guild, active_user_warns, guild_member, bot_member }) => {

    // Verificando se o membro e o executor estão no servidor
    if (!guild_member) return

    // Verificando se a hierarquia do membro que ativou o report é maior que o do alvo e se pode banir membros
    if (interaction.member.roles.highest.position <= guild_member.roles.highest.position || !interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers))
        return client.notify(guild.warn.channel, { content: client.tls.phrase(guild, "events.mute.falta_permissao", [7, 0], user_warn.uid) })

    // Verificando se a hierarquia do bot é maior que o do alvo e se pode banir membros
    if (bot_member.roles.highest.position <= guild_member.roles.highest.position || !bot_member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {

        // Bot não possui permissões para moderar membros
        if (!bot_member.permissions.has(PermissionsBitField.Flags.MuteMembers))
            return client.notify(guild.warn.channel, { content: client.tls.phrase(guild, "events.mute.sem_permissao_mute", [7, 0], user_warn.uid) })

        // Usuário alvo possui mais hierarquia que o bot
        return client.notify(guild.warn.channel, { content: client.tls.phrase(guild, "events.mute.sem_permissao_mute_2", [7, 0], user_warn.uid) })
    }

    const guild_warns = await listAllGuildWarns(client, interaction.guild.id)

    // Tempo de mute padrão do servidor para advertências
    const timeout = spamTimeoutMap[guild_warns[active_user_warns.length - 1].timeout] * 1000

    // Mutando o membro
    await guild_member.timeout(timeout, active_user_warns[active_user_warns.length - 1].relatory)
        .catch(console.error)
}