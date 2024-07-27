const { EmbedBuilder, AuditLogEvent, PermissionsBitField } = require('discord.js')
const {updateGuild} = require("../../../database/schemas/Guild");

module.exports = async ({ client, ban }) => {

    const guild = await client.getGuild(ban.guild.id)

    if (guild.network_member_ban_add && guild.conf_network) // Network de servidores
        client.network(guild, "ban_add", ban.user.id)

    // Verificando se a guild habilitou o logger
    if (!guild.logger_member_ban_add || !guild.conf_logger) return

    // Permissão para ver o registro de auditoria, desabilitando o logger
    if (!await client.permissions(ban, client.id(), PermissionsBitField.Flags.ViewAuditLog)) {
        await updateGuild(client, guild.id, { logger_member_ban_add: false })

        return client.notify(guild.logger_channel, { content: client.tls.phrase(guild, "mode.logger.permissao", 7) })
    }

    // Coletando dados sobre o evento
    const fetchedLogs = await ban.guild.fetchAuditLogs({
        type: AuditLogEvent.MemberBanAdd,
        limit: 1
    })

    const registroAudita = fetchedLogs.entries.first()
    let razao = `\n💂‍♂️ ${client.tls.phrase(guild, "mode.logger.sem_motivo")}`, network_descricao = "", canal_aviso = guild.logger_channel

    // Alterando o canal alvo conforme o filtro de eventos do death note
    if (guild.death_note && guild.death_note_member_ban_add && guild.death_note_channel)
        canal_aviso = guild.death_note_channel

    if (registroAudita.reason) { // Banimento com motivo explicado
        razao = `\n💂‍♂️ ${client.tls.phrase(guild, "mode.logger.motivo_ban")}: ${registroAudita.reason}`

        // Ação realizada através do network
        if (registroAudita.reason.includes("Network | ") && registroAudita.executorId === client.id()) {
            network_descricao = `📡 ${registroAudita.reason.split(" | ")[1]}`
            razao = ""

            if (guild.network_channel) // Ação realizada pelo network
                canal_aviso = guild.network_channel
        }
    }

    if (network_descricao.length > 1 || razao.length > 1)
        razao = `\n\`\`\`fix\n${network_descricao}${razao}\`\`\``

    const embed = new EmbedBuilder()
        .setTitle(client.tls.phrase(guild, "mode.logger.membro_banido"))
        .setColor(0xED4245)
        .setDescription(`${client.tls.phrase(guild, "mode.logger.membro_banido_desc", client.emoji("banidos"))}${razao}`)
        .setFields(
            {
                name: client.user_title(registroAudita.executor, guild, "mode.logger.autor", client.defaultEmoji("guard")),
                value: `${client.emoji("icon_id")} \`${registroAudita.executorId}\`\n${client.emoji("mc_name_tag")} \`${registroAudita.executor.username}\`\n( <@${registroAudita.executorId}> )`,
                inline: true
            },
            {
                name: `${client.defaultEmoji("person")} **${client.tls.phrase(guild, "util.server.membro")}**`,
                value: `${client.emoji("icon_id")} \`${registroAudita.targetId}\`\n${client.emoji("mc_name_tag")} \`${registroAudita.target.username}\`\n( <@${registroAudita.targetId}> )`,
                inline: true
            }
        )
        .setTimestamp()

    const obj = {
        embeds: [embed]
    }

    // Notificações do Death note
    if (guild.death_note.channel === canal_aviso && guild.death_note_notify)
        obj.content = "@here"

    client.notify(canal_aviso, obj)
}