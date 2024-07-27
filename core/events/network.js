const { PermissionsBitField, AuditLogEvent } = require('discord.js')

const { getNetworkedGuilds } = require('../database/schemas/Guild')

const { networkCases } = require('../formatters/patterns/guild')

const network_map = new Map()

module.exports = async ({ client, guild, caso, id_alvo }) => {

    if (client.x.debug_mode && registroAudita.executorId === "665002572926681128") return

    if (!network_map.has(id_alvo)) {
        network_map.set(id_alvo, true)

        // Permissão para ver o registro de auditoria, desabilitando o recurso
        if (!await client.permissions(guild.sid, client.id(), [PermissionsBitField.Flags.ViewAuditLog]))
            return client.notify(guild.logger.channel, { content: client.tls.phrase(guild, "mode.network.sem_permissao", 7) })

        const guilds_network = await getNetworkedGuilds(client, guild.network.link)
        const guild_evento = await client.guilds(guild.sid)
        let fetchedLogs

        if (caso === "ban_add") // Coletando dados sobre o evento
            fetchedLogs = await guild_evento.fetchAuditLogs({
                type: AuditLogEvent.MemberBanAdd,
                limit: 1
            })
        else if (caso === "ban_del")
            fetchedLogs = await guild_evento.fetchAuditLogs({
                type: AuditLogEvent.MemberBanRemove,
                limit: 1
            })
        else if (caso === "mute")
            fetchedLogs = await guild_evento.fetchAuditLogs({
                type: AuditLogEvent.MemberUpdate,
                limit: 1
            })
        else if (caso === "kick")
            fetchedLogs = await guild_evento.fetchAuditLogs({
                type: AuditLogEvent.MemberKick,
                limit: 1
            })

        const registroAudita = fetchedLogs.entries.first()
        if (!registroAudita || registroAudita.targetId !== id_alvo) return

        // Navegando pelos servidores do network
        for (let i = 0; i < guilds_network.length; i++) {

            let internal_guild = guilds_network[i]

            if (registroAudita.executorId !== client.id()) // Previne que outros bots acionem ações moderativas nos servidores do network
                if (!internal_guild.network.scanner.type && registroAudita.executor.bot) break

            // Verificando se o servidor é diferente e o recurso respectivo está sincronizado
            if (internal_guild.sid !== guild.sid && internal_guild.network[networkCases[caso]]) {

                let cached_guild = await client.guilds(internal_guild.sid)

                const bot_member = await client.getMemberGuild(internal_guild.sid, client.id())
                const guild_member = await client.getMemberGuild(internal_guild.sid, registroAudita.targetId)
                const guild_executor = await client.getMemberGuild(internal_guild.sid, registroAudita.executorId)

                // Redirecionando o evento para o end-point respectivo
                require(`./network/member_${caso}`)({ client, internal_guild, guild_evento, cached_guild, registroAudita, id_alvo, guild_member, guild_executor, bot_member })
            }
        }
    }

    setTimeout(() => { // Limpando a alteração do cache
        network_map.delete(id_alvo)
    }, 5000)
}