const { EmbedBuilder, AuditLogEvent, PermissionsBitField } = require('discord.js')
const {updateGuild} = require("../../../database/schemas/Guild");

module.exports = async ({ client, invite }) => {

    const guild = await client.getGuild(invite.guild.id)

    // Verificando se a guild habilitou o logger
    if (!guild.logger_invite_created || !guild.conf_logger) return

    // Permissão para ver o registro de auditoria, desabilitando o logger
    if (!await client.permissions(invite, client.id(), PermissionsBitField.Flags.ViewAuditLog)) {
        await updateGuild(client, guild.id, { logger_invite_created: false })

        return client.notify(guild.logger_channel, { content: client.tls.phrase(guild, "mode.logger.permissao", 7) })
    }

    // Coletando dados sobre o evento
    const fetchedLogs = await invite.guild.fetchAuditLogs({
        type: AuditLogEvent.InviteCreate,
        limit: 1
    })

    const registroAudita = fetchedLogs.entries.first()

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(guild, "mode.logger.convite_criado_titulo"))
        .setColor(0x29BB8E)
        .setDescription(client.tls.phrase(guild, "mode.logger.convite_criado", 43))
        .setFields(
            {
                name: client.user_title(registroAudita.executor, guild, "mode.logger.autor"),
                value: `${client.emoji("icon_id")} \`${registroAudita.executorId}\`\n${client.emoji("mc_name_tag")} \`${registroAudita.executor.username}\`\n( <@${registroAudita.executorId}> )`,
                inline: true
            },
            {
                name: `${client.emoji(44)} **${client.tls.phrase(guild, "menu.botoes.convite")}: ${invite.code}**`,
                value: `${registroAudita.target.maxUses > 0 ? `\n${client.emoji(8)} **${client.tls.phrase(guild, "mode.logger.limite_usos", null, registroAudita.target.maxUses)}**\n` : ""}${client.emoji(31)} **${client.tls.phrase(guild, "menu.botoes.destino")}:**\n:placard: \`${registroAudita.target.channel.name}\`\n( <#${registroAudita.target.channel.id}> )`,
                inline: true
            }
        )
        .setTimestamp()

    if (invite._expiresTimestamp)
        embed.addFields(
            {
                name: `${client.defaultEmoji("time")} **${client.tls.phrase(guild, "menu.botoes.expiracao")}**`,
                value: `${client.tls.phrase(guild, "menu.botoes.expirando")} <t:${parseInt(invite._expiresTimestamp / 1000)}:R>\n( <t:${parseInt(invite._expiresTimestamp / 1000)}:f> )`,
                inline: true
            }
        )

    client.notify(guild.logger_channel, { embeds: [embed] })
}