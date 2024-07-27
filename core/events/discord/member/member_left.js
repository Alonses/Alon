const { EmbedBuilder, AuditLogEvent, PermissionsBitField } = require('discord.js')

const { dropUserGuild } = require('../../../database/schemas/User_guilds.js')
const {updateGuild} = require("../../../database/schemas/Guild");

module.exports = async (client, dados) => {

    const guild = await client.getGuild(dados.guild.id)
    const user = await client.getUser(dados.user.id)

    // Removendo o servidor salvo em cache do usuário
    if (user.conf?.cached_guilds) dropUserGuild(user.uid, dados.guild.id)

    // Verificando se a guild habilitou o logger
    if (!guild.conf_logger) return

    // Permissão para ver o registro de auditoria, desabilitando o logger
    if (!await client.permissions(dados, client.id(), PermissionsBitField.Flags.ViewAuditLog)) {
        await updateGuild(client, guild.id, {
            logger_member_left: false,
            logger_member_kick: false,
            logger_member_ban_add: false
        })

        return client.notify(guild.logger_channel, {content: client.tls.phrase(guild, "mode.logger.permissao", 7)})
    }

    // Verificando se o usuário foi expulso do servidor
    const fetchedLogs2 = await dados.guild.fetchAuditLogs({
        type: AuditLogEvent.MemberKick,
        limit: 1
    })

    const registroAudita2 = fetchedLogs2.entries.first()
    const user_alvo = dados.user

    if (registroAudita2)
        if (registroAudita2.targetId === user_alvo.id) // Membro foi expulso do servidor
            return require('./member_kick.js')({ client, guild, user_alvo, registroAudita2 })

    // Verificando se o usuário foi banido
    const fetchedLogs = await dados.guild.fetchAuditLogs({
        type: AuditLogEvent.MemberBanAdd,
        limit: 1
    })

    const registroAudita = fetchedLogs.entries.first()

    if (registroAudita)
        if (registroAudita.targetId === user_alvo.id || !guild.logger_member_left)
            return // Usuário foi banido ou recurso desativado

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(guild, "mode.logger.membro_saiu"))
        .setColor(0xED4245)
        .setFields(
            {
                name: client.user_title(user_alvo, guild, "util.server.membro"),
                value: `${client.emoji("icon_id")} \`${user_alvo.id}\`\n${client.emoji("mc_name_tag")} \`${user_alvo.username}\`\n( <@${user_alvo.id}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("calendar")} **${client.tls.phrase(guild, "util.user.entrada")}**`,
                value: `<t:${parseInt(dados.joinedTimestamp / 1000)}:F> )`,
                inline: true
            }
        )
        .setTimestamp()

    const url_avatar = user_alvo.avatarURL({ dynamic: true, size: 2048 })
    if (url_avatar) embed.setThumbnail(url_avatar)

    client.notify(guild.logger_channel, { embeds: [embed] })
}